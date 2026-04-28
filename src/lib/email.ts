import nodemailer from "nodemailer";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

function createTransport() {
  if (!process.env.BREVO_SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST ?? "smtp-relay.brevo.com",
    port: Number(process.env.BREVO_SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_PASS,
    },
  });
}

async function send(opts: {
  to: string;
  toName?: string;
  replyTo?: string;
  subject: string;
  html: string;
}) {
  const transport = createTransport();
  if (!transport) return;
  await transport.sendMail({
    from: '"Feito de Gente" <contato@feitodegente.com.br>',
    to: opts.toName ? `"${opts.toName}" <${opts.to}>` : opts.to,
    replyTo: opts.replyTo,
    subject: opts.subject,
    html: opts.html,
  });
}

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f0eb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f0eb;padding:32px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px">

        <!-- Header -->
        <tr><td style="background:#1e3a5f;border-radius:16px 16px 0 0;padding:28px 36px;text-align:center">
          <div style="display:inline-flex;align-items:center;gap:10px">
            <div style="width:36px;height:36px;background:#e07b2a;border-radius:10px;display:inline-block;line-height:36px;text-align:center;font-size:18px">✦</div>
            <span style="color:white;font-size:20px;font-weight:700;letter-spacing:-0.3px">Feito de Gente</span>
          </div>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:white;padding:36px 36px 28px">
          ${content}
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#1e3a5f;border-radius:0 0 16px 16px;padding:20px 36px;text-align:center">
          <p style="margin:0;color:rgba(255,255,255,0.5);font-size:12px;line-height:1.6">
            © 2026 Feito de Gente · Marketplace de artesanato brasileiro<br>
            <a href="${BASE_URL}" style="color:rgba(255,255,255,0.4);text-decoration:none">feitodegente.com.br</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function itemsTable(items: { name: string; quantity: number; totalPrice: number }[]) {
  const rows = items
    .map(
      (i) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0ece6;font-size:13px;color:#333">${i.name}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f0ece6;font-size:13px;color:#888;text-align:center">${i.quantity}×</td>
      <td style="padding:10px 0;border-bottom:1px solid #f0ece6;font-size:13px;color:#1e3a5f;font-weight:600;text-align:right">
        R$ ${i.totalPrice.toFixed(2).replace(".", ",")}
      </td>
    </tr>`
    )
    .join("");

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px">
      <tr>
        <th style="padding:6px 0;font-size:11px;color:#bbb;text-transform:uppercase;letter-spacing:.06em;text-align:left;font-weight:600">Produto</th>
        <th style="padding:6px 0;font-size:11px;color:#bbb;text-transform:uppercase;letter-spacing:.06em;text-align:center;font-weight:600">Qtd</th>
        <th style="padding:6px 0;font-size:11px;color:#bbb;text-transform:uppercase;letter-spacing:.06em;text-align:right;font-weight:600">Total</th>
      </tr>
      ${rows}
    </table>`;
}

function ctaButton(href: string, label: string, color = "#1e3a5f") {
  return `
    <div style="text-align:center;margin-top:28px">
      <a href="${href}" style="display:inline-block;background:${color};color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:.02em">
        ${label}
      </a>
    </div>`;
}

function badge(text: string, color: string) {
  return `<div style="display:inline-block;background:${color};color:white;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;padding:4px 12px;border-radius:100px;margin-bottom:16px">${text}</div>`;
}

// ─── order emails ──────────────────────────────────────────────────────────────

export async function sendOrderConfirmedToCustomer(opts: {
  to: string;
  customerName: string;
  orderId: string;
  items: { name: string; quantity: number; totalPrice: number }[];
  total: number;
  storeName: string;
}) {
  const shortId = opts.orderId.slice(-8).toUpperCase();
  const content = `
    <div style="margin-bottom:24px">
      ${badge("Pedido confirmado", "#27ae60")}
      <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#1e3a5f;line-height:1.3">
        Seu pedido foi confirmado! ✦
      </h1>
      <p style="margin:0;color:#888;font-size:14px">
        Olá, <strong>${opts.customerName}</strong>! Recebemos seu pedido e o artesão já foi notificado.
      </p>
    </div>

    <div style="background:#f7f3ed;border-radius:12px;padding:16px 20px;margin-bottom:20px">
      <p style="margin:0;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:.06em">Pedido</p>
      <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#1e3a5f;font-family:monospace">#${shortId}</p>
      <p style="margin:4px 0 0;font-size:13px;color:#888">${opts.storeName}</p>
    </div>

    ${itemsTable(opts.items)}

    <div style="text-align:right;padding:10px 0;border-top:2px solid #f0ece6;margin-bottom:8px">
      <span style="font-size:15px;font-weight:700;color:#1e3a5f">
        Total: R$ ${opts.total.toFixed(2).replace(".", ",")}
      </span>
    </div>

    <p style="font-size:13px;color:#888;line-height:1.6;margin-top:16px">
      Você receberá um novo e-mail quando seu pedido for enviado com o código de rastreio.
    </p>

    ${ctaButton(`${BASE_URL}/conta/pedidos`, "Acompanhar pedido →", "#e07b2a")}
  `;

  await send({
    to: opts.to,
    toName: opts.customerName,
    subject: `Pedido #${shortId} confirmado — Feito de Gente`,
    html: baseTemplate(content),
  });
}

export async function sendNewOrderToArtisan(opts: {
  to: string;
  artisanName: string;
  storeName: string;
  orderId: string;
  items: { name: string; quantity: number; totalPrice: number }[];
  subtotal: number;
  customerCity?: string | null;
  customerState?: string | null;
}) {
  const shortId = opts.orderId.slice(-8).toUpperCase();
  const location = [opts.customerCity, opts.customerState].filter(Boolean).join("/");

  const content = `
    <div style="margin-bottom:24px">
      ${badge("Novo pedido", "#e07b2a")}
      <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#1e3a5f;line-height:1.3">
        Você recebeu um novo pedido! 🎉
      </h1>
      <p style="margin:0;color:#888;font-size:14px">
        Olá, <strong>${opts.artisanName}</strong>! Um cliente fez um pedido na sua loja <strong>${opts.storeName}</strong>.
      </p>
    </div>

    <div style="background:#f7f3ed;border-radius:12px;padding:16px 20px;margin-bottom:20px;display:flex;gap:24px">
      <div>
        <p style="margin:0;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:.06em">Pedido</p>
        <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#1e3a5f;font-family:monospace">#${shortId}</p>
      </div>
      ${location ? `<div>
        <p style="margin:0;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:.06em">Destino</p>
        <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#1e3a5f">${location}</p>
      </div>` : ""}
    </div>

    ${itemsTable(opts.items)}

    <div style="text-align:right;padding:10px 0;border-top:2px solid #f0ece6;margin-bottom:16px">
      <span style="font-size:15px;font-weight:700;color:#1e3a5f">
        Subtotal: R$ ${opts.subtotal.toFixed(2).replace(".", ",")}
      </span>
    </div>

    <p style="font-size:13px;color:#888;line-height:1.6">
      Acesse o seu painel para confirmar o recebimento e atualizar o status do pedido.
    </p>

    ${ctaButton(`${BASE_URL}/dashboard/pedidos`, "Ver pedido no painel →")}
  `;

  await send({
    to: opts.to,
    toName: opts.artisanName,
    subject: `Novo pedido #${shortId} na sua loja — Feito de Gente`,
    html: baseTemplate(content),
  });
}

export async function sendOrderShippedToCustomer(opts: {
  to: string;
  customerName: string;
  orderId: string;
  storeName: string;
  trackingCode: string;
}) {
  const shortId = opts.orderId.slice(-8).toUpperCase();
  const content = `
    <div style="margin-bottom:24px">
      ${badge("Pedido enviado", "#2c4f7b")}
      <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#1e3a5f;line-height:1.3">
        Seu pedido está a caminho! 📦
      </h1>
      <p style="margin:0;color:#888;font-size:14px">
        Olá, <strong>${opts.customerName}</strong>! <strong>${opts.storeName}</strong> acabou de enviar o seu pedido.
      </p>
    </div>

    <div style="background:#edf2f8;border:1px solid #dce6f0;border-radius:14px;padding:20px 24px;margin-bottom:24px;text-align:center">
      <p style="margin:0 0 6px;font-size:12px;color:#2c4f7b;text-transform:uppercase;letter-spacing:.08em;font-weight:700">Código de rastreio</p>
      <p style="margin:0;font-size:24px;font-weight:800;color:#1e3a5f;letter-spacing:2px;font-family:monospace">${opts.trackingCode}</p>
    </div>

    <p style="font-size:13px;color:#888;line-height:1.6;text-align:center">
      Pedido <span style="font-family:monospace;font-weight:700;color:#1e3a5f">#${shortId}</span>
      · vendido por ${opts.storeName}
    </p>

    ${ctaButton("https://rastreamento.correios.com.br/app/index.php", "Rastrear nos Correios →", "#2c4f7b")}

    <p style="font-size:12px;color:#bbb;text-align:center;margin-top:20px">
      Você também pode acompanhar pelo painel de pedidos no site.
    </p>
  `;

  await send({
    to: opts.to,
    toName: opts.customerName,
    subject: `Pedido #${shortId} enviado — código ${opts.trackingCode}`,
    html: baseTemplate(content),
  });
}

export async function sendOrderDeliveredToCustomer(opts: {
  to: string;
  customerName: string;
  orderId: string;
  storeName: string;
}) {
  const shortId = opts.orderId.slice(-8).toUpperCase();
  const content = `
    <div style="margin-bottom:24px">
      ${badge("Entregue", "#27ae60")}
      <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#1e3a5f;line-height:1.3">
        Seu pedido chegou! 🎁
      </h1>
      <p style="margin:0;color:#888;font-size:14px">
        Olá, <strong>${opts.customerName}</strong>! Seu pedido de <strong>${opts.storeName}</strong> foi marcado como entregue.
      </p>
    </div>

    <div style="background:#f7f3ed;border-radius:12px;padding:16px 20px;margin-bottom:24px;text-align:center">
      <p style="margin:0;font-size:13px;color:#888">Pedido</p>
      <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#1e3a5f;font-family:monospace">#${shortId}</p>
    </div>

    <div style="background:#f0f7ee;border:1px solid #c8e0c0;border-radius:12px;padding:20px 24px;margin-bottom:24px;text-align:center">
      <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#2a5a1a">Gostou do que recebeu?</p>
      <p style="margin:0;font-size:13px;color:#27ae60;line-height:1.5">
        Sua avaliação ajuda outros compradores e incentiva o trabalho artesanal.
        Leva menos de 1 minuto!
      </p>
    </div>

    ${ctaButton(`${BASE_URL}/conta/pedidos`, "Avaliar minha compra ★", "#e07b2a")}
  `;

  await send({
    to: opts.to,
    toName: opts.customerName,
    subject: `Pedido #${shortId} entregue — deixe sua avaliação`,
    html: baseTemplate(content),
  });
}

// ─── artisan status emails ─────────────────────────────────────────────────────

export async function sendArtisanApproved(opts: {
  to: string;
  artisanName: string;
  storeName: string;
}) {
  const content = `
    <div style="margin-bottom:24px">
      ${badge("Cadastro aprovado", "#27ae60")}
      <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#1e3a5f;line-height:1.3">
        Parabéns, ${opts.artisanName}! Sua loja está no ar ✦
      </h1>
      <p style="margin:0;color:#888;font-size:14px">
        O cadastro de <strong>${opts.storeName}</strong> foi aprovado pela nossa equipe.
      </p>
    </div>

    <div style="background:#f0f7ee;border:1px solid #c8e0c0;border-radius:12px;padding:20px 24px;margin-bottom:24px">
      <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#2a5a1a">O que fazer agora:</p>
      <ul style="margin:0;padding:0 0 0 18px;color:#27ae60;font-size:13px;line-height:2">
        <li>Acesse o <strong>Dashboard</strong> e cadastre seus primeiros produtos</li>
        <li>Complete o perfil da sua loja com foto e biografia</li>
        <li>Compartilhe sua loja nas redes sociais</li>
      </ul>
    </div>

    <p style="font-size:13px;color:#888;line-height:1.6">
      A partir de agora seus produtos ficam visíveis para todos os compradores do Feito de Gente.
      Boas vendas!
    </p>

    ${ctaButton(`${BASE_URL}/dashboard`, "Acessar meu painel →", "#27ae60")}
  `;

  await send({
    to: opts.to,
    toName: opts.artisanName,
    subject: `Sua loja "${opts.storeName}" foi aprovada — Feito de Gente`,
    html: baseTemplate(content),
  });
}

export async function sendArtisanRejected(opts: {
  to: string;
  artisanName: string;
  storeName: string;
  reason?: string | null;
}) {
  const content = `
    <div style="margin-bottom:24px">
      ${badge("Cadastro em revisão", "#e07b2a")}
      <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#1e3a5f;line-height:1.3">
        Olá, ${opts.artisanName}. Precisamos de mais informações.
      </h1>
      <p style="margin:0;color:#888;font-size:14px">
        Analisamos o cadastro de <strong>${opts.storeName}</strong> e não foi possível aprová-lo no momento.
      </p>
    </div>

    ${opts.reason ? `
    <div style="border-left:3px solid #e07b2a;padding:14px 18px;background:#fffbf7;border-radius:0 10px 10px 0;margin-bottom:24px">
      <p style="margin:0 0 6px;font-size:11px;color:#bbb;text-transform:uppercase;letter-spacing:.06em">Motivo</p>
      <p style="margin:0;color:#444;font-size:14px;line-height:1.7">${opts.reason}</p>
    </div>` : `
    <div style="background:#f7f3ed;border-radius:12px;padding:16px 20px;margin-bottom:24px">
      <p style="margin:0;font-size:13px;color:#666;line-height:1.6">
        Verifique se seus produtos são de produção própria e artesanal, se as fotos e descrições
        representam fielmente o trabalho, e se os dados da loja estão completos.
      </p>
    </div>`}

    <p style="font-size:13px;color:#888;line-height:1.6;margin-bottom:8px">
      Você pode entrar em contato com nossa equipe para entender melhor o que precisa ser ajustado
      e reenviar o cadastro.
    </p>

    ${ctaButton(`${BASE_URL}/contato`, "Falar com a equipe →", "#1e3a5f")}
  `;

  await send({
    to: opts.to,
    toName: opts.artisanName,
    subject: `Atualização sobre o cadastro de "${opts.storeName}" — Feito de Gente`,
    html: baseTemplate(content),
  });
}

// ─── password reset ────────────────────────────────────────────────────────────

export async function sendPasswordReset(opts: {
  to: string;
  name: string;
  token: string;
}) {
  const resetUrl = `${BASE_URL}/recuperar-senha/${opts.token}`;

  const content = `
    <div style="margin-bottom:24px">
      ${badge("Redefinir senha", "#1e3a5f")}
      <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#1e3a5f;line-height:1.3">
        Redefinir sua senha
      </h1>
      <p style="margin:0;color:#888;font-size:14px">
        Olá, <strong>${opts.name}</strong>! Recebemos um pedido para redefinir a senha da sua conta.
      </p>
    </div>

    <div style="background:#f7f3ed;border-radius:12px;padding:20px 24px;margin-bottom:24px;text-align:center">
      <p style="margin:0 0 16px;font-size:14px;color:#555;line-height:1.6">
        Clique no botão abaixo para criar uma nova senha.<br>
        Este link é válido por <strong>1 hora</strong>.
      </p>
      ${ctaButton(resetUrl, "Criar nova senha →", "#e07b2a")}
    </div>

    <p style="font-size:12px;color:#bbb;text-align:center;line-height:1.6">
      Se você não solicitou a redefinição de senha, ignore este e-mail.<br>
      Sua senha não será alterada.
    </p>

    <div style="margin-top:20px;padding:12px 16px;background:#fff8f3;border:1px solid #fde8d0;border-radius:10px">
      <p style="margin:0;font-size:11px;color:#c87a3a">
        Por segurança, nunca compartilhe este link com ninguém.
      </p>
    </div>
  `;

  await send({
    to: opts.to,
    toName: opts.name,
    subject: "Redefinir senha — Feito de Gente",
    html: baseTemplate(content),
  });
}

// ─── contact emails ────────────────────────────────────────────────────────────

export async function sendContactNotification(msg: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@feitodegente.com.br";

  const content = `
    <div style="margin-bottom:24px">
      <div style="display:inline-block;background:#e07b2a;color:white;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;padding:4px 12px;border-radius:100px;margin-bottom:16px">Nova mensagem</div>
      <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#1e3a5f;line-height:1.3">Você recebeu uma mensagem de contato</h1>
      <p style="margin:0;color:#888;font-size:14px">Alguém entrou em contato pelo site.</p>
    </div>

    <!-- Dados do remetente -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f3ed;border-radius:12px;padding:20px;margin-bottom:20px">
      <tr>
        <td style="padding:5px 0;width:70px;color:#999;font-size:13px;vertical-align:top">Nome</td>
        <td style="padding:5px 0;font-weight:600;color:#1e3a5f;font-size:13px">${msg.name}</td>
      </tr>
      <tr>
        <td style="padding:5px 0;color:#999;font-size:13px;vertical-align:top">E-mail</td>
        <td style="padding:5px 0;color:#444;font-size:13px">
          <a href="mailto:${msg.email}" style="color:#e07b2a;text-decoration:none">${msg.email}</a>
        </td>
      </tr>
      <tr>
        <td style="padding:5px 0;color:#999;font-size:13px;vertical-align:top">Assunto</td>
        <td style="padding:5px 0;color:#444;font-size:13px">${msg.subject}</td>
      </tr>
    </table>

    <!-- Mensagem -->
    <div style="border-left:3px solid #e07b2a;padding:14px 18px;background:#fffbf7;border-radius:0 10px 10px 0;margin-bottom:28px">
      <p style="margin:0 0 6px;font-size:11px;color:#bbb;text-transform:uppercase;letter-spacing:.06em">Mensagem</p>
      <p style="margin:0;color:#444;font-size:14px;line-height:1.7;white-space:pre-wrap">${msg.message}</p>
    </div>

    <!-- CTA -->
    <div style="text-align:center">
      <a href="${BASE_URL}/admin/mensagens"
         style="display:inline-block;background:#1e3a5f;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:.02em">
        Responder no painel →
      </a>
      <p style="margin:14px 0 0;font-size:12px;color:#bbb">
        Ou responda diretamente a este email para contatar ${msg.name}.
      </p>
    </div>
  `;

  await send({
    to: adminEmail,
    replyTo: msg.email,
    subject: `[Contato] ${msg.subject} — ${msg.name}`,
    html: baseTemplate(content),
  });
}

export async function sendReplyNotification(opts: {
  to: string;
  clientName: string;
  subject: string;
  originalMessage: string;
  reply: string;
  token: string;
}) {
  const content = `
    <div style="margin-bottom:24px">
      <div style="display:inline-block;background:#27ae60;color:white;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;padding:4px 12px;border-radius:100px;margin-bottom:16px">Resposta recebida</div>
      <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#1e3a5f;line-height:1.3">Olá, ${opts.clientName}! ✦</h1>
      <p style="margin:0;color:#888;font-size:14px">Respondemos à sua mensagem. Veja abaixo.</p>
    </div>

    <!-- Resposta -->
    <div style="background:#1e3a5f;border-radius:14px;padding:22px 24px;margin-bottom:20px">
      <p style="margin:0 0 10px;font-size:11px;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:.08em;font-weight:600">Resposta da equipe Feito de Gente</p>
      <p style="margin:0;color:white;font-size:15px;line-height:1.75;white-space:pre-wrap">${opts.reply}</p>
    </div>

    <!-- Mensagem original -->
    <div style="border:1px solid #ebebeb;border-radius:12px;padding:18px 20px;margin-bottom:28px">
      <p style="margin:0 0 8px;font-size:11px;color:#bbb;text-transform:uppercase;letter-spacing:.06em">Sua mensagem original</p>
      <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#888">${opts.subject}</p>
      <p style="margin:0;font-size:13px;color:#999;line-height:1.6;white-space:pre-wrap">${opts.originalMessage}</p>
    </div>

    <!-- CTA -->
    <div style="text-align:center;background:#f7f3ed;border-radius:14px;padding:24px">
      <p style="margin:0 0 16px;color:#666;font-size:14px;line-height:1.5">
        Clique abaixo para ver a conversa completa<br>e enviar uma nova mensagem se precisar.
      </p>
      <a href="${BASE_URL}/contato/resposta/${opts.token}"
         style="display:inline-block;background:#e07b2a;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:.02em">
        Ver conversa completa →
      </a>
    </div>
  `;

  await send({
    to: opts.to,
    toName: opts.clientName,
    subject: `Re: ${opts.subject} — Feito de Gente`,
    html: baseTemplate(content),
  });
}
