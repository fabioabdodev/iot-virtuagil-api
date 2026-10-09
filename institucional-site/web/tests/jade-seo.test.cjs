const test = require("node:test")
const assert = require("node:assert/strict")
const { readFileSync } = require("node:fs")
const { join } = require("node:path")
const read = path => readFileSync(join(__dirname, "..", path), "utf8")
test("Jade é a chamada principal no cabeçalho e na Home", () => {
  const header=read("components/site/site-header.tsx")
  const home=read("components/site/home-page.tsx")
  assert.match(header, /Falar com a Jade/)
  assert.match(home, /Falar com a Jade/)
  assert.match(home, /Ver planos e preços/)
  assert.match(header, /jadeWhatsappUrl\(whatsappUrl\)/)
})
test("CTA mobile aparece fora do checkout e preserva contato", () => {
  const mobile=read("components/site/jade-mobile-contact.tsx")
  assert.match(mobile, /md:hidden/)
  assert.match(mobile, /startsWith\('\/contratar-assistente-ia'\)/)
  assert.match(mobile, /startsWith\('\/pagamento'\)/)
  assert.match(mobile, /aria-label/)
  const helper=read("lib/jade-contact.ts")
  assert.match(helper, /url\.searchParams\.set\('text'/)
  assert.match(helper, /wa\.me/)
})
test("SEO cobre Jornada, Hospedagem e dados reais", () => {
  const layout=read("app/layout.tsx")
  const home=read("app/page.tsx")
  const sitemap=read("app/sitemap.ts")
  assert.match(layout, /Hospedagem/)
  assert.match(home, /Jade/)
  assert.doesNotMatch(sitemap, /lastModified: now/)
  assert.match(sitemap, /new Map/)
})
test("auditor SEO confere canonical, sitemap, noindex e CTA", () => {
  const audit=read("scripts/seo-health.mjs")
  for (const mark of ["canonical","sitemap.xml","robots.txt","noindex","Falar com a Jade","SEO_AUDIT_OK"]) {
    assert.ok(audit.includes(mark), mark)
  }
})

test("canonical da Home aceita URL normalizada e páginas OG têm imagem", () => {
  const audit = read("scripts/seo-health.mjs")
  assert.match(audit, /canonicalUrl\.pathname!==path/)
  for (const path of [
    "app/page.tsx", "app/planos/page.tsx", "app/contato/page.tsx",
    "app/solucoes/page.tsx", "app/contratar-assistente-ia/page.tsx",
    "app/solucoes/[slug]/page.tsx",
  ]) {
    assert.match(read(path), /images:\s*\[\{\s*url: '\/brand\/logomarca.png'/)
  }
})

test("preço da Agenda em todas as seções usa o catálogo ativo", () => {
  const planos = read("app/planos/page.tsx")
  assert.match(planos, /agendaPlan\.total/)
  assert.match(planos, /agendaPlan\.installmentValue/)
  assert.doesNotMatch(planos, /R\$ 2\.394|R\$ 399/)
})

test("guias práticos têm sitemap, entrada navegável e metadados próprios", () => {
  const sitemap=read("app/sitemap.ts")
  const index=read("app/guias/page.tsx")
  const detail=read("app/guias/[slug]/page.tsx")
  const guides=read("lib/guides.ts")
  const nav=read("components/site/site-header.tsx")
  assert.match(sitemap, /guidePages/)
  assert.match(index, /<h1/)
  assert.match(detail, /Article/)
  assert.match(detail, /BreadcrumbList/)
  assert.ok(nav.includes('href="/guias"'))
  for (const slug of [
    "assistente-ia-whatsapp-pequenas-empresas",
    "agendamento-automatico-whatsapp",
    "whatsapp-para-pousadas-reservas",
    "monitoramento-iot-temperatura-energia-gases",
  ]) assert.ok(guides.includes(slug))
})
test("IndexNow envia só URLs de conteúdo alterado após SEO em produção", () => {
  const script = read("scripts/indexnow.mjs")
  const workflow = read("../../.github/workflows/site-seo-health.yml")
  assert.ok(script.includes('api.indexnow.org/indexnow'))
  assert.match(script, /INDEXNOW_IGNORADO/)
  assert.match(script, /keyLocation/)
  assert.ok(workflow.includes('indexnow.mjs'))
  assert.match(workflow, /continue-on-error: true/)
})

test("segmentos têm páginas únicas, úteis e estrutura reutilizável", () => {
  const sitemap = read("app/sitemap.ts")
  const catalog = read("lib/segments.ts")
  const listing = read("app/segmentos/page.tsx")
  const detail = read("app/segmentos/[slug]/page.tsx")
  const home = read("components/site/home-page.tsx")
  const nav = read("components/site/site-header.tsx")
  const indexnow = read("scripts/indexnow.mjs")
  assert.match(sitemap, /segmentPages/)
  assert.ok(sitemap.includes("segments.map"))
  assert.ok(listing.includes("<h1"))
  assert.ok(detail.includes("<h1"))
  assert.ok(detail.includes("generateStaticParams"))
  assert.ok(detail.includes("BreadcrumbList"))
  assert.ok(detail.includes("getSegment"))
  assert.ok(detail.includes("s.precautions"))
  assert.ok(nav.includes('href="/segmentos"'))
  assert.ok(indexnow.includes("lib/segments.ts"))
  assert.ok(indexnow.includes("includePrefix('/segmentos')"))
  for (const slug of [
    "clinicas-estetica", "odontologia", "saloes-beleza",
    "lojas-comercio", "profissionais-liberais", "clinicas-consultorios",
    "prestadores-servicos",
  ]) {
    assert.ok(catalog.includes("slug: '"+slug+"'"), slug)
    assert.ok(home.includes("'/segmentos/"+slug+"'"), slug)
  }
})

test("Schema Product e Service têm imagens, provedor e metadados úteis", () => {
  const planos = read("app/planos/page.tsx")
  const product = read("app/solucoes/[slug]/page.tsx")
  assert.ok(planos.includes("image: ['https://www.virtuagil.com.br/solucoes/atendente-ia.svg']"))
  assert.ok(product.includes("logo: 'https://www.virtuagil.com.br/brand/logomarca.png'"))
  assert.ok(product.includes("product.slug === 'atendente-ia'"))
})
