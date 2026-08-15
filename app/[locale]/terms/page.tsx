import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });
  return { title: t("title") };
}

export default function TermsPage() {
  const t = useTranslations("terms");

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
            color: "rgba(147,197,253,0.35)",
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

        <TermsContent />
      </div>
    </main>
  );
}

function TermsContent() {
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
      <Section title="1. Aceitação dos Termos">
        <p>
          Ao acessar ou utilizar qualquer produto do ecossistema{" "}
          <strong style={{ color: "#fff" }}>Kairos Labs</strong>, você concorda com estes Termos de
          Uso. Se não concordar, não utilize os serviços.
        </p>
        <p>
          Estes Termos são complementados pela{" "}
          <Link href="/privacy" style={{ color: "rgba(147,197,253,0.9)" }}>
            Política de Privacidade
          </Link>
          , que descreve como tratamos seus dados pessoais.
        </p>
      </Section>

      <Section title="2. Descrição dos Serviços">
        <p>
          A Kairos Labs desenvolve e opera um ecossistema de produtos de software, incluindo (sem
          limitação): <strong style={{ color: "#fff" }}>DevPrint, Ascend, Elucya Talk, Ágora Global,
          Talvrix</strong> e o portal institucional <strong style={{ color: "#fff" }}>Kairos Labs</strong>.
        </p>
        <p>
          Todos os produtos utilizam ou podem utilizar tecnologias de{" "}
          <strong style={{ color: "#fff" }}>inteligência artificial generativa</strong> para fornecer
          funcionalidades ao usuário.
        </p>
      </Section>

      <Section title="3. Uso de Inteligência Artificial — Transparência Obrigatória">
        <p>
          Em conformidade com o <strong style={{ color: "#fff" }}>EU AI Act (Regulamento UE 2024/1689,
          Art. 50)</strong> e com as boas práticas da <strong style={{ color: "#fff" }}>LGPD</strong> e
          do <strong style={{ color: "#fff" }}>GDPR</strong>, informamos:
        </p>
        <ul style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <li>
            Os produtos Kairos Labs utilizam modelos de IA de terceiros, incluindo{" "}
            <strong style={{ color: "#fff" }}>Claude (Anthropic), Gemini (Google),
            GPT-4o (OpenAI)</strong> e outros, conforme descrito em cada produto.
          </li>
          <li>
            Todo conteúdo gerado por IA e apresentado ao usuário é identificado com uma marcação
            visual explícita na interface.
          </li>
          <li>
            A IA nos nossos produtos funciona como <strong style={{ color: "#fff" }}>assistente</strong>:
            apresenta sugestões, análises e informações. Decisões que afetam o usuário são sempre
            de responsabilidade do próprio usuário.
          </li>
          <li>
            Os modelos de IA podem conter imprecisões. Recomendamos sempre verificar informações
            críticas com fontes primárias.
          </li>
          <li>
            Você tem direito de solicitar revisão humana de qualquer análise de IA que lhe diga
            respeito (LGPD Art. 20 / GDPR Art. 22), pelo e-mail{" "}
            <a href="mailto:contact.kairoslabs@gmail.com" style={{ color: "rgba(147,197,253,0.9)" }}>
              contact.kairoslabs@gmail.com
            </a>
            .
          </li>
        </ul>
      </Section>

      <Section title="4. Cadastro e Conta de Usuário">
        <p>
          Ao se cadastrar em qualquer produto Kairos Labs, você declara que:
        </p>
        <ul style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <li>Tem pelo menos 18 anos de idade (ou autorização parental)</li>
          <li>As informações fornecidas são verdadeiras e atualizadas</li>
          <li>Leu e aceita esta política e a Política de Privacidade</li>
        </ul>
        <p>
          Você é responsável por manter a confidencialidade de suas credenciais de acesso.
        </p>
      </Section>

      <Section title="5. Uso Permitido">
        <p>Você pode utilizar os serviços Kairos Labs para fins lícitos, pessoais ou profissionais.</p>
        <p>
          <strong style={{ color: "#fff" }}>É expressamente proibido:</strong>
        </p>
        <ul style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <li>Usar os serviços para atividades ilegais ou que violem direitos de terceiros</li>
          <li>Tentar acessar dados de outros usuários ou sistemas internos</li>
          <li>Usar técnicas de engenharia reversa ou scraping não autorizado</li>
          <li>Introduzir malware, vírus ou qualquer código malicioso</li>
          <li>Usar os serviços para gerar conteúdo enganoso, discriminatório ou ilegal</li>
          <li>Usar saídas da IA para tomar decisões em nome de terceiros sem seu conhecimento</li>
        </ul>
      </Section>

      <Section title="6. Propriedade Intelectual">
        <p>
          O software, design, marca, logotipo e conteúdo dos produtos Kairos Labs são propriedade
          de Cesar Pizarro / Kairos Labs (Marca Registrada INPI nº 944610498), protegidos pela
          Lei de Direitos Autorais (Lei 9.610/98) e legislação aplicável.
        </p>
        <p>
          O conteúdo gerado pela IA a partir de <em>seus próprios dados</em> (ex: análise do seu
          currículo, do seu histórico de commits) é de sua propriedade, sujeito às licenças dos
          modelos de IA utilizados.
        </p>
      </Section>

      <Section title="7. Limitação de Responsabilidade">
        <p>
          Os produtos Kairos Labs são fornecidos &quot;no estado em que se encontram&quot;. Não nos
          responsabilizamos por:
        </p>
        <ul style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <li>Decisões tomadas com base em análises ou sugestões geradas pela IA</li>
          <li>Imprecisões nos outputs dos modelos de IA de terceiros</li>
          <li>Indisponibilidade temporária do serviço por manutenção ou falha técnica</li>
          <li>Danos indiretos, lucros cessantes ou perda de dados além do nosso controle</li>
        </ul>
        <p>
          Nossa responsabilidade máxima, em qualquer caso, fica limitada ao valor pago pelo usuário
          pelo serviço nos 3 meses anteriores ao evento.
        </p>
      </Section>

      <Section title="8. Disponibilidade do Serviço">
        <p>
          Buscamos manter disponibilidade contínua, mas não garantimos disponibilidade ininterrupta.
          Podemos realizar manutenções planejadas com aviso prévio ou manutenções emergenciais sem aviso.
        </p>
      </Section>

      <Section title="9. Cancelamento e Exclusão de Conta">
        <p>
          Você pode cancelar seu cadastro e solicitar exclusão completa dos seus dados a qualquer
          momento pelo e-mail{" "}
          <a href="mailto:contact.kairoslabs@gmail.com" style={{ color: "rgba(147,197,253,0.9)" }}>
            contact.kairoslabs@gmail.com
          </a>
          . A exclusão será processada em até 15 dias.
        </p>
        <p>
          Nos reservamos o direito de suspender ou encerrar contas que violem estes Termos, mediante
          aviso prévio quando possível.
        </p>
      </Section>

      <Section title="10. Modificações dos Termos">
        <p>
          Podemos atualizar estes Termos. Em caso de alterações materiais, notificaremos por e-mail
          cadastrado com pelo menos 30 dias de antecedência. O uso continuado após a data de vigência
          das novas condições constitui aceite.
        </p>
      </Section>

      <Section title="11. Lei Aplicável e Foro">
        <p>
          Estes Termos são regidos pela legislação brasileira, em especial a LGPD (Lei 13.709/2018)
          e o Marco Civil da Internet (Lei 12.965/2014).
        </p>
        <p>
          Para usuários da União Europeia, aplica-se também o GDPR (Reg. 2016/679) e o EU AI Act
          (Reg. 2024/1689).
        </p>
        <p>
          Fica eleito o foro da comarca de domicílio do usuário para dirimir controvérsias, sem
          prejuízo de meios alternativos de resolução de conflitos.
        </p>
      </Section>

      <Section title="12. Contato">
        <p>
          Para dúvidas, solicitações ou reclamações:{" "}
          <a href="mailto:contact.kairoslabs@gmail.com" style={{ color: "rgba(147,197,253,0.9)" }}>
            contact.kairoslabs@gmail.com
          </a>
        </p>
        <p>Respondemos em até 48 horas úteis.</p>
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
