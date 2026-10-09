import type { MetadataRoute } from 'next';
import { products } from '@/lib/products';
import { guides } from '@/lib/guides';

const baseUrl = 'https://www.virtuagil.com.br';

export default function sitemap(): MetadataRoute.Sitemap {
  // Não marcar cada URL como alterada em todas as requisições do sitemap.
  // Só publicar lastModified quando houver data real de alteração editorial.

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/solucoes`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/solucoes/iot`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/contato`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/planos`, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${baseUrl}/guias`, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${baseUrl}/contratar-assistente-ia`, changeFrequency: 'monthly', priority: 0.95 },
    { url: `${baseUrl}/termos-de-contratacao`, changeFrequency: 'yearly', priority: 0.45 },
    { url: `${baseUrl}/politica-de-privacidade`, changeFrequency: 'yearly', priority: 0.45 },
    { url: `${baseUrl}/exclusao-de-dados`, changeFrequency: 'yearly', priority: 0.4 },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/solucoes/${product.slug}`,

    changeFrequency: 'monthly',
    priority: product.slug === 'atendente-ia' ? 0.95 : 0.75,
  }));

  const guidePages: MetadataRoute.Sitemap = guides.map((guide) => ({
    url: `${baseUrl}/guias/${guide.slug}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Evita entradas duplicadas quando uma página pertence ao catálogo e às rotas fixas.
  return [...new Map([...staticPages, ...productPages, ...guidePages].map(item => [item.url, item])).values()];
}
