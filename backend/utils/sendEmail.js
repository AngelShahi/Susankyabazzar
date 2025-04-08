import nodemailer from 'nodemailer'

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other services like SendGrid, Mailgun, etc.
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your email app password (not your actual password)
    },
  })

  const mailOptions = {
    from: `"Susankyabazar" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  }

  await transporter.sendMail(mailOptions)
}

export default sendEmail
