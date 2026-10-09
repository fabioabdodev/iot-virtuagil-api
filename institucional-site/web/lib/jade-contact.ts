const DEFAULT_JADE_WHATSAPP = 'https://wa.me/553171029727';

export function jadeWhatsappUrl(baseUrl = DEFAULT_JADE_WHATSAPP, origin: 'site' | 'planos' | 'contato' = 'site') {
  let url: URL;
  try {
    url = new URL(baseUrl);
    if (url.protocol !== 'https:' ||
      !['wa.me', 'api.whatsapp.com', 'web.whatsapp.com'].includes(url.hostname)) {
      throw new Error('Unsupported host');
    }
  } catch {
    url = new URL(DEFAULT_JADE_WHATSAPP);
  }
  url.searchParams.set('text',
    origin === 'planos'
      ? 'Olá, Jade! Vi os planos no site da Virtuagil. Pode me ajudar a escolher e contratar?'
      : origin === 'contato'
        ? 'Olá, Jade! Quero tirar dúvidas sobre a Virtuagil e falar sobre meu negócio.'
        : 'Olá, Jade! Vim pelo site da Virtuagil. Quero conhecer o assistente, tirar dúvidas e saber como contratar.');
  return url.toString();
}
