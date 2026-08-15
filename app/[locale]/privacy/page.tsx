import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return { title: t("title") };
}

export default function PrivacyPage() {
  const t = useTranslations("privacy");

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "rgba(5,10,30,1)",
        padding: "5rem 1.5rem 4rem",
      }}
    >
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.8rem",
            color: "rgba(147,197,253,0.7)",
            textDecoration: "none",
            marginBottom: "2rem",
          }}
        >
          ← Kairos Labs
        </Link>

        <h1
          style={{
            fontSize: "clamp(1.6rem, 4vw, 2.25rem)",
            fontWeight: 700,
            color: "#fff",
            marginBottom: "0.5rem",
          }}
        >
          {t("title")}
        </h1>
        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)", marginBottom: "3rem" }}>
          {t("lastUpdated")}
        </p>

        <PolicyContent />
      </div>
    </main>
  );
}

function PolicyContent() {
  return (
    <div
      style={{
        color: "rgba(255,255,255,0.75)",
        fontSize: "0.9rem",
        lineHeight: 1.8,
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
      }}
    >
      <Section title="1. Controlador dos Dados">
        <p>
          Os dados pessoais coletados pelos produtos do ecossistema Kairos Labs são controlados por{" "}
          <strong style={{ color: "#fff" }}>Cesar Pizarro</strong>, operando sob a marca{" "}
          <strong style={{ color: "#fff" }}>Kairos Labs</strong> (Marca Registrada INPI nº 944610498).
        </p>
        <p>
          <strong style={{ color: "#fff" }}>Contato do Encarregado (DPO):</strong>{" "}
          <a href="mailto:cab.pizarro@gmail.com" style={{ color: "rgba(147,197,253,0.9)" }}>
            cab.pizarro@gmail.com
          </a>
        </p>
        <p>
          Prazo de resposta: até 15 dias (LGPD) / até 30 dias (GDPR).
        </p>
      </Section>

      <Section title="2. Dados Coletados e Finalidades">
        <p>Coletamos apenas os dados estritamente necessários para cada finalidade:</p>
        <Table
          headers={["Dado", "Finalidade", "Base Legal"]}
          rows={[
            ["E-mail", "Lista de espera dos produtos; notificação de lançamento", "Consentimento (LGPD Art. 7, I / GDPR Art. 6.1.a)"],
            ["Nome", "Identificação em formulários de contato", "Consentimento"],
            ["Mensagem de contato", "Atendimento a solicitações comerciais", "Consentimento / Execução de contrato"],
            ["Anexos enviados", "Suporte ao atendimento de proposta", "Consentimento"],
            ["Dados de navegação (logs técnicos)", "Segurança e diagnóstico técnico", "Interesse legítimo (LGPD Art. 7, IX / GDPR Art. 6.1.f)"],
          ]}
        />
        <p>
          Não coletamos dados de pagamento, dados de saúde, dados biométricos, nem dados de menores
          de 18 anos sem consentimento parental.
        </p>
      </Section>

      <Section title="3. Uso de Inteligência Artificial">
        <p>
          Os produtos Kairos Labs utilizam tecnologias de <strong style={{ color: "#fff" }}>inteligência artificial
          generativa</strong> de terceiros para fornecer análises, sugestões e conteúdo personalizado.
          Em conformidade com o <strong style={{ color: "#fff" }}>EU AI Act (Art. 50)</strong>, todo conteúdo
          gerado por IA é identificado com uma marcação visível na interface.
        </p>
        <p>
          <strong style={{ color: "#fff" }}>Princípio fundamental:</strong> a IA nos nossos produtos atua como
          assistente — apresenta informações, sugestões e análises. Decisões que afetam o usuário são
          sempre tomadas pelo próprio usuário, nunca de forma autônoma pela IA.
        </p>
        <p>
          Em conformidade com a <strong style={{ color: "#fff" }}>LGPD (Art. 20)</strong> e o{" "}
          <strong style={{ color: "#fff" }}>GDPR (Art. 22)</strong>, você tem direito de solicitar revisão
          humana de qualquer análise gerada por IA que lhe diga respeito. Para isso, entre em contato
          pelo e-mail acima.
        </p>
        <p>
          Os modelos de IA utilizados podem incluir: Claude (Anthropic), Gemini (Google), GPT-4o (OpenAI),
          e Whisper / AssemblyAI para transcrição de áudio.
        </p>
      </Section>

      <Section title="4. Compartilhamento com Terceiros (Subprocessadores)">
        <p>
          Seus dados podem ser processados pelos seguintes subprocessadores, todos com acordos de
          proteção de dados compatíveis com LGPD e GDPR:
        </p>
        <Table
          headers={["Empresa", "Serviço", "País", "Garantia"]}
          rows={[
            ["Supabase Inc.", "Banco de dados e autenticação", "EUA", "SCCs"],
            ["Vercel Inc.", "Hospedagem da aplicação", "EUA", "SCCs"],
            ["Anthropic PBC", "IA generativa (Claude)", "EUA", "SCCs"],
            ["Google LLC", "IA generativa (Gemini)", "EUA", "SCCs"],
            ["OpenAI LLC", "IA generativa (GPT) — Elucya Talk", "EUA", "SCCs"],
            ["AssemblyAI", "Transcrição de áudio — Elucya Talk", "EUA", "SCCs"],
          ]}
        />
        <p>
          Não vendemos, alugamos nem compartilhamos seus dados com terceiros para fins de marketing.
        </p>
      </Section>

      <Section title="5. Retenção de Dados">
        <p>Mantemos seus dados pelo tempo necessário para as finalidades declaradas:</p>
        <ul style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <li>Dados de lista de espera: até o lançamento do produto ou solicitação de exclusão</li>
          <li>Dados de contato comercial: até 2 anos ou encerramento da relação</li>
          <li>Dados de conta em produtos lançados: enquanto a conta estiver ativa + 90 dias</li>
          <li>Logs técnicos: até 12 meses</li>
        </ul>
      </Section>

      <Section title="6. Seus Direitos">
        <p>
          Você tem os seguintes direitos sobre seus dados, exercíveis pelo e-mail{" "}
          <a href="mailto:cab.pizarro@gmail.com" style={{ color: "rgba(147,197,253,0.9)" }}>
            cab.pizarro@gmail.com
          </a>
          :
        </p>
        <Table
          headers={["Direito", "O que significa"]}
          rows={[
            ["Acesso", "Receber uma cópia de todos os seus dados que mantemos"],
            ["Correção", "Corrigir dados incorretos ou incompletos"],
            ["Exclusão", "Solicitar a exclusão de todos os seus dados (\"direito ao esquecimento\")"],
            ["Portabilidade", "Receber seus dados em formato estruturado (CSV/JSON)"],
            ["Oposição", "Opor-se a um tratamento específico, incluindo marketing"],
            ["Revisão humana", "Solicitar revisão humana de qualquer análise ou decisão gerada por IA"],
          ]}
        />
      </Section>

      <Section title="7. Cookies e Rastreamento">
        <p>
          Utilizamos apenas cookies estritamente necessários para o funcionamento da aplicação
          (autenticação, preferência de idioma). Não utilizamos cookies de rastreamento de terceiros
          nem pixels de publicidade.
        </p>
      </Section>

      <Section title="8. Segurança">
        <p>
          Adotamos as seguintes medidas técnicas de proteção: Row Level Security (RLS) em todas as
          tabelas de dados, transmissão exclusivamente via HTTPS, criptografia de dados em repouso
          (padrão Supabase), e acesso administrativo protegido por autenticação forte.
        </p>
        <p>
          Em caso de incidente de segurança que afete seus dados, você será notificado sem demora
          injustificada, nos termos da LGPD (Art. 48) e do GDPR (Art. 33).
        </p>
      </Section>

      <Section title="9. Transferências Internacionais">
        <p>
          Como operamos com subprocessadores nos Estados Unidos, seus dados podem ser transferidos
          internacionalmente. Todas as transferências são amparadas por Cláusulas Contratuais Padrão
          (Standard Contractual Clauses — SCCs) aprovadas pela Comissão Europeia, em conformidade
          com o GDPR Cap. V.
        </p>
      </Section>

      <Section title="10. Alterações nesta Política">
        <p>
          Esta política pode ser atualizada. Em caso de alterações materiais, publicaremos um aviso
          no site com pelo menos 30 dias de antecedência. A versão em vigor é sempre a disponível
          nesta página, com a data de última atualização indicada no topo.
        </p>
      </Section>

      <Section title="11. Reclamações">
        <p>
          Se você acredita que seus dados foram tratados de forma incorreta, pode registrar uma
          reclamação junto à:
        </p>
        <ul style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <li>
            <strong style={{ color: "#fff" }}>ANPD</strong> (Brasil):{" "}
            <span style={{ color: "rgba(147,197,253,0.7)" }}>anpd.gov.br</span>
          </li>
          <li>
            <strong style={{ color: "#fff" }}>Autoridade supervisora do seu país da UE</strong> (se aplicável)
          </li>
        </ul>
        <p>Recomendamos entrar em contato conosco primeiro — resolvemos a maioria dos casos diretamente.</p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2
        style={{
          fontSize: "1rem",
          fontWeight: 600,
          color: "#fff",
          marginBottom: "0.75rem",
          paddingBottom: "0.5rem",
          borderBottom: "1px solid rgba(59,130,246,0.15)",
        }}
      >
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {children}
      </div>
    </section>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: "auto", borderRadius: "0.375rem", border: "1px solid rgba(59,130,246,0.15)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
        <thead>
          <tr style={{ background: "rgba(59,130,246,0.08)" }}>
            {headers.map((h) => (
              <th
                key={h}
                style={{
                  padding: "0.5rem 0.75rem",
                  textAlign: "left",
                  color: "rgba(255,255,255,0.9)",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderTop: "1px solid rgba(59,130,246,0.1)" }}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  style={{
                    padding: "0.5rem 0.75rem",
                    color: j === 0 ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.6)",
                    fontWeight: j === 0 ? 500 : 400,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
