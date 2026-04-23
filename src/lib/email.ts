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
      <div style="display:inline-block;background:#4a7c3f;color:white;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;padding:4px 12px;border-radius:100px;margin-bottom:16px">Resposta recebida</div>
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
