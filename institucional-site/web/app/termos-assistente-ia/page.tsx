import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Termos de Contratação do Assistente de IA',
  description: 'Condições de contratação, implantação, uso, cancelamento e responsabilidades do Assistente de IA Virtuagil.',
  alternates: { canonical: '/termos-assistente-ia' },
};

const sections = [
  ['1. Objeto do serviço', 'O plano dá direito ao uso do Assistente de IA Virtuagil durante o período contratado, dentro dos limites informados na oferta. A contratação não significa entrega instantânea de uma automação pronta: após o pagamento existe uma etapa de implantação, configuração e validação com informações fornecidas pelo cliente.'],
  ['2. Pré-requisitos do WhatsApp', 'Na modalidade atual, a integração utiliza a Evolution API e requer uma conta do WhatsApp vinculada a um número de telefone sob responsabilidade do cliente. Para separar o atendimento da empresa do WhatsApp pessoal, recomendamos um número exclusivo para o Assistente de IA. O cliente pode usar um aparelho dedicado ou, para reduzir custos, um aparelho compatível com dual SIM/eSIM, mantendo no mesmo celular a linha pessoal e a linha do Assistente. Linha, chip/eSIM, plano da operadora, aparelho e custos relacionados não estão incluídos no preço da Virtuagil, salvo contratação expressa em contrário.'],
  ['2.1. Aparelho, conexão e funcionamento 24 horas', 'O atendimento automatizado ocorre na infraestrutura da Virtuagil e não depende de uma pessoa ficar operando o celular. Pelas regras atuais de dispositivos vinculados do WhatsApp, o telefone principal não precisa permanecer conectado à internet o tempo todo; porém, ele continua necessário para registrar a conta, vincular novos dispositivos e manter a conta ativa. Para maior segurança operacional, recomendamos manter o aparelho carregado, atualizado, protegido por senha e com acesso periódico ao WhatsApp. O cliente não deve desligar, desinstalar, trocar o número, redefinir ou alterar a conta sem comunicar a Virtuagil, pois isso pode exigir nova vinculação e interromper o atendimento.'],
  ['2.2. Configuração prática recomendada', 'Não é necessário comprar um celular sofisticado. O requisito oficial é usar uma versão de Android ou iOS ainda compatível com o WhatsApp. Como recomendação prática da Virtuagil, prefira um Android ainda atualizado, com pelo menos 4 GB de RAM, 64 GB de armazenamento, Wi‑Fi/4G ou 5G e suporte a dual SIM/eSIM quando a empresa quiser manter duas linhas no mesmo aparelho. Esses números são uma recomendação operacional, não uma exigência técnica oficial do WhatsApp. Antes da implantação, a Virtuagil pode orientar o cliente sobre a opção mais econômica para seu cenário.'],
  ['3. Implantação', 'A implantação depende do envio, pelo cliente, de dados corretos sobre a empresa, produtos, serviços, horários, regras de atendimento, perguntas frequentes, contatos e demais conteúdos necessários. O prazo de ativação começa após o recebimento das informações e dos acessos indispensáveis. Mudanças relevantes de escopo, integrações especiais ou personalizações fora do plano podem exigir orçamento separado.'],
  ['4. Plano, limite e pagamento', 'O plano semestral custa R$ 1.794,00 e pode ser pago conforme as modalidades apresentadas no checkout. A referência a 6x de R$ 299,00 representa o parcelamento do valor total do plano semestral e não uma mensalidade independente. O plano inclui até 500 atendimentos por mês. Condições diferentes somente valem quando formalizadas pela Virtuagil.'],
  ['5. Uso e responsabilidades do cliente', 'O cliente é responsável pela legalidade e exatidão do conteúdo fornecido, pelas instruções dadas ao Assistente de IA, pela linha de WhatsApp e por manter suas credenciais e acessos seguros. O serviço não deve ser usado para práticas ilícitas, abusivas, discriminatórias, fraudulentas, spam ou violação de direitos de terceiros.'],
  ['6. Inteligência artificial e atendimento humano', 'Respostas geradas por inteligência artificial podem apresentar limitações. O cliente deve definir regras, conteúdos e situações que exigem atendimento humano. A Virtuagil não garante que toda resposta automatizada será perfeita nem substitui revisão profissional quando a atividade envolver decisões jurídicas, médicas, financeiras ou outras matérias reguladas.'],
  ['7. Plataformas de terceiros', 'O funcionamento pode depender de serviços de terceiros, como WhatsApp, Evolution API, provedores de infraestrutura e integrações contratadas. Alterações, indisponibilidades, bloqueios ou mudanças de política dessas plataformas podem afetar o serviço. A Virtuagil adotará medidas razoáveis para restabelecer a operação quando o evento estiver sob sua capacidade técnica de atuação.'],
  ['8. Cancelamento, rescisão e arrependimento', 'O cliente pode solicitar cancelamento pelos canais disponibilizados pela Virtuagil. Quando a contratação estiver sujeita às normas de proteção do consumidor, serão respeitados os direitos legais aplicáveis, inclusive o direito de arrependimento nas hipóteses previstas em lei. Encerrado o período já contratado, não haverá renovação ou cobrança além do que tiver sido expressamente informado e aceito. Eventuais regras específicas de reembolso, serviços já executados e rescisão serão aplicadas de acordo com a legislação e com a situação concreta, sem exclusão de direitos legalmente assegurados.'],
  ['9. Proteção de dados e LGPD', 'Cada parte deve cumprir a Lei Geral de Proteção de Dados Pessoais (LGPD). Em regra, o cliente define as finalidades e os dados tratados em seu atendimento e deve possuir base legal adequada para esse tratamento. A Virtuagil trata os dados necessários à prestação do serviço conforme suas responsabilidades legais e contratuais, aplicando medidas de segurança compatíveis com o serviço. O cliente deve informar seus próprios usuários sobre o tratamento de dados realizado em seu atendimento.'],
  ['10. Segurança e confidencialidade', 'A Virtuagil adota medidas técnicas e administrativas razoáveis para proteger informações e acessos relacionados ao serviço. O cliente deve restringir credenciais às pessoas autorizadas, usar senhas seguras e comunicar imediatamente qualquer suspeita de acesso indevido ou incidente.'],
  ['11. Disponibilidade e manutenção', 'O serviço depende de internet, infraestrutura em nuvem e plataformas externas e, portanto, não é prometida disponibilidade ininterrupta de 100%. Manutenções, falhas de terceiros e eventos fora do controle razoável da Virtuagil podem provocar indisponibilidade temporária.'],
  ['12. Alterações e suporte', 'Alterações relevantes nestes termos serão comunicadas de forma adequada quando aplicável. Dúvidas, solicitações, reclamações, cancelamento e questões relacionadas à privacidade podem ser encaminhadas pelo canal de WhatsApp indicado no site.'],
];

export default function TermosAssistenteIaPage() {
  return (
    <main className="pb-20">
      <section className="section-shell py-14 md:py-20">
        <div className="eyebrow">Contratação transparente</div>
        <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold tracking-[-0.04em] text-white md:text-6xl">Termos de Contratação do Assistente de IA</h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300">Leia estas condições antes de contratar. Elas explicam o que está incluído, o que o cliente precisa providenciar e como funciona a implantação do serviço.</p>
        <div className="mt-8 rounded-[24px] border border-amber-300/20 bg-amber-300/[0.06] p-5 text-sm leading-7 text-slate-300">
          <strong className="text-white">Importante:</strong> 6x de R$ 299,00 é uma forma de pagamento do plano semestral de R$ 1.794,00. Não é uma mensalidade que inclua aparelho, linha telefônica, chip, plano de operadora ou qualquer integração personalizada fora do escopo.
        </div>
        <div className="mt-10 grid gap-5">
          {sections.map(([title, text]) => <section key={title} className="surface-glass rounded-[24px] p-6"><h2 className="text-xl font-bold text-white">{title}</h2><p className="mt-3 text-sm leading-7 text-slate-400">{text}</p></section>)}
        </div>
        <p className="mt-8 text-xs leading-6 text-slate-500">Última atualização: setembro de 2026. Estes termos devem ser interpretados em conjunto com a Política de Privacidade e com a oferta apresentada no momento da contratação.</p>
        <Link href="/contratar-assistente-ia" className="mt-8 inline-flex text-sm font-semibold text-emerald-300 hover:text-emerald-200">Voltar para contratação</Link>
      </section>
    </main>
  );
}
