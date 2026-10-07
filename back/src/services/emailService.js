const nodemailer = require('nodemailer');

function criarTransportador() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SEGURO === 'true',
    auth: {
      user: process.env.EMAIL_USUARIO,
      pass: process.env.EMAIL_SENHA,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

async function enviarEmailRecuperacao(destinatario, nomeUsuario, token) {
  const transportador = criarTransportador();
  await transportador.verify();

  const primeiroNome = nomeUsuario.split(' ')[0];

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Recuperacao de senha MedSync</title>
</head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;padding:40px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:560px;width:100%;">
<tr>
<td style="background:#1D4ED8;padding:32px 40px;text-align:center;">
<span style="font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.5px;">MedSync</span>
</td>
</tr>
<tr>
<td style="padding:40px 40px 20px;">
<h1 style="margin:0 0 8px;font-size:20px;color:#0F172A;font-weight:700;">Recuperacao de senha</h1>
<p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">
Ola, ${primeiroNome}. Recebemos uma solicitacao para redefinir a senha da sua conta MedSync.
</p>
<p style="margin:0 0 12px;color:#475569;font-size:14px;">
Use o codigo abaixo para criar uma nova senha:
</p>
<div style="background:#EFF6FF;border:2px dashed #2563EB;border-radius:12px;padding:24px;text-align:center;margin:0 0 28px;">
<div style="font-size:11px;font-weight:700;color:#2563EB;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">
Codigo de recuperacao
</div>
<div style="font-size:36px;font-weight:800;color:#1D4ED8;letter-spacing:0.2em;font-family:monospace;">
${token}
</div>
<div style="font-size:12px;color:#64748B;margin-top:8px;">
Valido por 1 hora
</div>
</div>
<p style="margin:0 0 8px;color:#475569;font-size:14px;line-height:1.6;">
Acesse a tela de recuperacao no MedSync e informe este codigo junto com sua nova senha.
</p>
<p style="margin:0 0 28px;color:#94A3B8;font-size:13px;line-height:1.6;">
Se voce nao solicitou esta alteracao, ignore este e-mail. Sua senha nao sera alterada.
</p>
<hr style="border:none;border-top:1px solid #E2E8F0;margin:0 0 24px;" />
<p style="margin:0;color:#94A3B8;font-size:12px;text-align:center;line-height:1.6;">
Este e-mail foi enviado automaticamente pelo MedSync. Nao responda a esta mensagem.
</p>
</td>
</tr>
<tr>
<td style="background:#F8FAFF;padding:18px 40px;text-align:center;border-top:1px solid #E2E8F0;">
<p style="margin:0;font-size:12px;color:#94A3B8;">MedSync</p>
</td>
</tr>
</table>
</td></tr>
</table>
</body>
</html>
  `.trim();

  const texto = `Ola, ${primeiroNome}.\n\nSeu codigo de recuperacao de senha e: ${token}\n\nEle e valido por 1 hora.\n\nSe nao foi voce, ignore este e-mail.\n\nMedSync`;

  const info = await transportador.sendMail({
    from: process.env.EMAIL_REMETENTE || `MedSync <${process.env.EMAIL_USUARIO}>`,
    to: destinatario,
    subject: `Codigo de recuperacao MedSync: ${token}`,
    text: texto,
    html,
  });

  console.log(`E-mail enviado para ${destinatario} - id ${info.messageId}`);
  return info;
}

module.exports = { enviarEmailRecuperacao };
