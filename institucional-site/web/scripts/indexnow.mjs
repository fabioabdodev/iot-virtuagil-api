#!/usr/bin/env node
// IndexNow: comunica somente URLs realmente alteradas no commit publicado.
// A chave é pública por especificação; não é uma credencial nem um token pessoal.
import { execFileSync } from 'node:child_process';

const origin = 'https://www.virtuagil.com.br';
const key = 'd8f542acb6014e7f9360ab5d2c4e89f1';
const api = 'https://api.indexnow.org/indexnow';
const dryRun = process.argv.includes('--dry-run');
const timeout = ms => AbortSignal.timeout(ms);

async function main() {
  const output = execFileSync('git', ['show', '--pretty=format:', '--name-only', 'HEAD'], {encoding: 'utf8'});
  const changes = output.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  const root = 'institucional-site/web/';
  const files = changes.filter(f => f.startsWith(root)).map(f => f.slice(root.length));
  if (!files.length) {
    console.log('INDEXNOW_IGNORADO: commit sem alterações no site institucional.');
    return;
  }

  const res = await fetch(origin + '/sitemap.xml', { signal: timeout(12000), cache: 'no-store' });
  if (!res.ok) throw Error('Sitemap HTTP ' + res.status);
  const xml = await res.text();
  const sitemapUrls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(m => m[1]).filter(url => { try {return new URL(url).origin === origin;} catch {return false;} });
  if (!sitemapUrls.length) throw Error('Sitemap vazio ou inválido');

  const impacted = new Set();
  function include(path) {
    for (const url of sitemapUrls) {
      if (new URL(url).pathname === path) impacted.add(url);
    }
  }
  function includePrefix(prefix) {
    for (const url of sitemapUrls) {
      if (new URL(url).pathname.startsWith(prefix)) impacted.add(url);
    }
  }
  for (const file of files) {
    if (/^(app\/layout\.tsx|app\/robots\.ts|app\/sitemap\.ts|lib\/guides\.ts)$/.test(file)) {
      // Mudança global de metadados ou inventário: todas as URLs podem ter mudado.
      if (file === 'lib/guides.ts') includePrefix('/guias');
      else sitemapUrls.forEach(url => impacted.add(url));
    } else if (/^app\/guias\/\[slug\]\/page\.tsx$/.test(file)) {
      includePrefix('/guias/');
    } else if (/^app\/solucoes\/\[slug\]\/page\.tsx$/.test(file) || file === 'lib/products.ts') {
      includePrefix('/solucoes/');
    } else if (file.startsWith('app/') && file.endsWith('/page.tsx')) {
      const path = file.replace(/^app\//, '/').replace(/\/page\.tsx$/, '');
      include(path === '/page.tsx' ? '/' : path);
    } else if (file === 'app/page.tsx' || file === 'components/site/home-page.tsx') {
      include('/');
    } else if (file.startsWith('components/site/') || file.startsWith('public/brand/')) {
      include('/');
    }
  }
  const urls = [...impacted];
  if (!urls.length) {
    console.log('INDEXNOW_IGNORADO: nenhuma URL pública alterada no commit.');
    return;
  }
  console.log('INDEXNOW_CANDIDATAS: ' + urls.length + ' URLs do sitemap.');
  if (dryRun) return;

  const check = await fetch(origin + '/' + key + '.txt', {signal: timeout(12000)});
  if (!check.ok || (await check.text()).trim() !== key) throw Error('Arquivo de verificação IndexNow indisponível.');
  const result = await fetch(api, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({host: 'www.virtuagil.com.br', key, keyLocation: origin + '/' + key + '.txt', urlList: urls}),
    signal: timeout(15000),
  });
  if (result.status !== 200 && result.status !== 202) throw Error('IndexNow HTTP ' + result.status);
  console.log('INDEXNOW_ENVIADO: ' + urls.length + ' URLs, HTTP ' + result.status + '. Descoberta solicitada; indexação não é garantida.');
}
main().catch(error => {console.error('INDEXNOW_FALHOU: ' + error.message); process.exitCode = 1;});
