import { NextRequest, NextResponse } from "next/server";
import { createServerAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";
import type { IssueDraftJson } from "@/lib/types";

const GITHUB_OWNER = "CabPiz";
const GITHUB_REPO = "kairos-labs";
const GITHUB_PROJECT_NUMBER = 3;

/**
 * POST /api/admin/create-github-issue — cria uma issue no GitHub a partir de um draft revisado.
 * Requer sessão de fundador e GITHUB_PAT com escopo `repo`.
 * Adiciona automaticamente a issue ao Project Board e marca o feedback como convertido.
 */
export async function POST(req: NextRequest) {
  const client = await createServerSupabaseClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pat = process.env.GITHUB_PAT;
  if (!pat) {
    return NextResponse.json({ error: "GITHUB_PAT não configurado" }, { status: 500 });
  }

  const body = await req.json() as {
    feedbackId?: string;
    title?: string;
    issueBody?: string;
    labels?: string[];
    milestone?: string;
  };

  if (!body.feedbackId) {
    return NextResponse.json({ error: "feedbackId é obrigatório" }, { status: 400 });
  }

  const supabase = createServerAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: feedback, error } = await (supabase as any)
    .from("feedback")
    .select("issue_draft, notify_on_completion")
    .eq("id", body.feedbackId)
    .single();

  if (error || !feedback) {
    return NextResponse.json({ error: "Feedback não encontrado" }, { status: 404 });
  }

  const draft = feedback.issue_draft as IssueDraftJson | null;
  const title = body.title ?? draft?.title ?? "(sem título)";
  const issueBody = body.issueBody ?? draft?.body ?? "";
  const labels = body.labels ?? draft?.labels ?? [];

  // Criar issue via REST API
  const issueRes = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, body: issueBody, labels }),
    },
  );

  if (!issueRes.ok) {
    return NextResponse.json({ error: "Falha ao criar issue no GitHub" }, { status: 500 });
  }

  const issueData = await issueRes.json() as { number: number; html_url: string; node_id: string };

  // Adicionar ao Project Board via GraphQL
  const projectNodeId = await getProjectNodeId(pat, GITHUB_OWNER, GITHUB_PROJECT_NUMBER);
  if (projectNodeId) {
    await addIssueToProject(pat, projectNodeId, issueData.node_id);
  }

  // Atualizar feedback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("feedback").update({
    github_issue_number: issueData.number,
    github_issue_url: issueData.html_url,
  }).eq("id", body.feedbackId);

  // Registrar em feedback_notifications se notify_on_completion
  if (feedback.notify_on_completion as boolean) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("feedback_notifications").insert({
      feedback_id: body.feedbackId,
      github_issue_number: issueData.number,
    });
  }

  return NextResponse.json({
    status: "success",
    issueNumber: issueData.number,
    issueUrl: issueData.html_url,
  });
}

async function getProjectNodeId(pat: string, owner: string, projectNumber: number): Promise<string | null> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${pat}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `query { user(login:"${owner}") { projectV2(number:${projectNumber}) { id } } }`,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json() as { data?: { user?: { projectV2?: { id: string } } } };
  return data.data?.user?.projectV2?.id ?? null;
}

async function addIssueToProject(pat: string, projectId: string, contentId: string): Promise<void> {
  await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${pat}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `mutation { addProjectV2ItemById(input:{projectId:"${projectId}",contentId:"${contentId}"}) { item { id } } }`,
    }),
  });
}
