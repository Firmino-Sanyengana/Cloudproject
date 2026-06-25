import nodemailer from "nodemailer";

let transporter = null;
if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
}

export async function sendMail({ to, subject, text, html }) {
  const from = process.env.SMTP_FROM || "Sofulano Ukulondja <no-reply@sofulano.local>";
  if (!transporter) {
    console.log("\n========== [EMAIL - MODO CONSOLE] ==========");
    console.log("De:    ", from);
    console.log("Para:  ", to);
    console.log("Assunto:", subject);
    console.log("Texto: ", text);
    console.log("============================================\n");
    return { simulated: true };
  }
  return transporter.sendMail({ from, to, subject, text, html });
}
