import nodemailer from 'nodemailer'

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Use Gmail, Outlook, or SMTP service
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS, // Your email password or app password
    },
  })

  const mailOptions = {
    from: `"Susankyabazar" <${process.env.EMAIL_USER}>`, // Sender
    to: options.email, // Recipient
    subject: options.subject, // Email Subject
    text: options.message, // Email Body (Plain Text)
    html: options.html, // Optional HTML body
  }

  await transporter.sendMail(mailOptions)
}

export default sendEmail
