FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install

FROM node:22-alpine AS builder
WORKDIR /app
ARG NEXT_PUBLIC_WHATSAPP_URL=https://wa.me/5531999990000
ARG NEXT_PUBLIC_CONTACT_EMAIL=contato@virtuagil.com.br
ARG NEXT_PUBLIC_MONITOR_URL=https://monitor.virtuagil.com.br
ARG NEXT_PUBLIC_MERCADO_PAGO_PAYMENT_URL=
ENV NEXT_PUBLIC_WHATSAPP_URL=$NEXT_PUBLIC_WHATSAPP_URL
ENV NEXT_PUBLIC_CONTACT_EMAIL=$NEXT_PUBLIC_CONTACT_EMAIL
ENV NEXT_PUBLIC_MONITOR_URL=$NEXT_PUBLIC_MONITOR_URL
ENV NEXT_PUBLIC_MERCADO_PAGO_PAYMENT_URL=$NEXT_PUBLIC_MERCADO_PAGO_PAYMENT_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_PUBLIC_WHATSAPP_URL=https://wa.me/5531999990000
ENV NEXT_PUBLIC_CONTACT_EMAIL=contato@virtuagil.com.br
ENV NEXT_PUBLIC_MONITOR_URL=https://monitor.virtuagil.com.br
ENV NEXT_PUBLIC_MERCADO_PAGO_PAYMENT_URL=
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./app/.next/static
COPY --from=builder /app/public ./app/public
EXPOSE 3000
CMD ["node", "app/server.js"]
