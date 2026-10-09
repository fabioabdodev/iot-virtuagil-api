#!/usr/bin/env node
// Auditoria de conteúdo PÚBLICO: páginas, indexação, metadados e CTA Jade.
const origin = "https://www.virtuagil.com.br"
const pages = [
  "/", "/planos", "/solucoes", "/solucoes/atendente-ia",
  "/solucoes/iot", "/contratar-assistente-ia", "/contato",
  "/termos-de-contratacao", "/politica-de-privacidade", "/exclusao-de-dados",
]
const abort = () => AbortSignal.timeout(18000)
async function read(path) {
  const res=await fetch(origin+path,{redirect:"follow",signal:abort(),cache:"no-store"})
  if(!res.ok)throw Error("HTTP "+res.status+" "+path)
  return res.text()
}
async function main() {
  const sitemap=await read("/sitemap.xml")
  const robots=await read("/robots.txt")
  if(!robots.includes("Sitemap:") || !sitemap.includes("/planos")) {
    throw Error("Sitemap ou robots.txt incompletos")
  }
  const sUrls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1])
  if(sUrls.length!==new Set(sUrls).size)throw Error("URLs duplicadas no sitemap")
  const issues=[]
  const warnings=[]
  const sitemapPaths=sUrls.filter(url=>url.startsWith(origin+"/"))
    .map(url=>new URL(url).pathname)
  // Inclui TODAS as páginas indexáveis (inclusive detalhes de produtos).
  const allPages=[...new Set([...pages,...sitemapPaths])]
  const titles=new Map()
  let checked=0
  for(const path of allPages){
    const html=await read(path)
    const title=html.match(/<title>([^<]+)<\/title>/i)?.[1]||""
    if(!title.includes("Virtuagil"))issues.push("Title sem marca: "+path+" => "+JSON.stringify(title.slice(0,120)))
    if(titles.has(title))warnings.push("Title repetido: "+path+" / "+titles.get(title))
    else titles.set(title,path)
    if(title.length>70)warnings.push("Title muito longo ("+title.length+"): "+path)
    if(!/<meta[^>]+name="description"/i.test(html))issues.push("Description ausente: "+path)
    if(!/<meta[^>]+property="og:title"/i.test(html))warnings.push("OpenGraph título ausente: "+path)
    if(!/<meta[^>]+property="og:image"/i.test(html))warnings.push("OpenGraph imagem ausente: "+path)
    if(!/<html[^>]+lang="pt-BR"/i.test(html))issues.push("Idioma pt-BR ausente: "+path)
    const h1s=(html.match(/<h1(?:\s|>)/gi)||[]).length
    if(h1s!==1)issues.push("H1 deve ser único, encontrados "+h1s+": "+path)
    if(!/<h1[\s>]/i.test(html))throw Error("H1 ausente: "+path)
    const canonical=html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)?.[1]||
      html.match(/<link[^>]+href="([^"]+)"[^>]+rel="canonical"/i)?.[1]||""
    const canonicalUrl=canonical ? new URL(canonical) : null
    if(!canonicalUrl || canonicalUrl.origin!==origin || canonicalUrl.pathname!==path || canonicalUrl.search || canonicalUrl.hash)
      issues.push("Canonical diferente: "+path+" => "+canonical)
    checked++
    console.log("SEO_OK "+path+" — title/canonical/description/H1/idioma")
  }
  const home=await read("/")
  if(!home.includes("Falar com a Jade") || !home.includes("wa.me/")) {
    issues.push("CTA da Jade não encontrado na Home")
  }
  if(!home.includes("Agenda") || !home.includes("Hospedagem"))issues.push("Módulos faltando na Home")
  for(const path of ["/pagamento/sucesso","/pagamento/pendente","/pagamento/erro"]){
    const html=await read(path)
    if(!/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(html) &&
       !/<meta[^>]+content="[^"]*noindex[^"]*"[^>]+name="robots"/i.test(html)) {
      issues.push("Página de pagamento indexável: "+path)
    }
  }
  // Captura oportunidade comercial nas três entradas de maior intenção.
  for(const path of ["/","/planos","/contato"]) {
    const html=await read(path)
    if(!html.includes("Falar com a Jade") || !/wa\.me\//.test(html))
      issues.push("CTA Jade ausente em "+path)
  }
  for(const warning of warnings)console.log("SEO_AVISO "+warning)
  if(issues.length)throw Error(issues.join(" | "))
  console.log("SEO_AUDIT_OK: "+checked+" páginas (todas do sitemap), 3 retornos não indexáveis, CTA Jade, "+warnings.length+" avisos. Sem operações reais.")
}
main().catch(err=>{console.error("SEO_AUDIT_FAILED: "+String(err.message));process.exitCode=1})
