const
  ejs = require('ejs'),
  nodemailer = require('nodemailer'),
  config = require('../config/index'),
  email = {}

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: config.email.auth,
})

const renderResetPwdTemplateFile = (ejsData) => {
  return new Promise((resolve, reject) => {
    ejs.renderFile(`${__dirname}/../views/resetPwd.ejs`, ejsData, (err, content) => {
      if (!err && content) {
        resolve(content)
      } else {
        reject(err)
      }
    })
  })
}

const renderVerifyEmailTemplateFile = (ejsData) => {
  return new Promise((resolve, reject) => {
    ejs.renderFile(`${__dirname}/../views/verification.ejs`, ejsData, (err, content) => {
      if (!err && content) {
        resolve(content)
      } else {
        reject(err)
      }
    })
  })
}

email.verify = async () => {
  return new Promise((resolve, reject) => {
    transporter.verify((err, success) => {
      if (err) {
        reject(err)
      } else {
        resolve(success)
      }
    })
  })
}

const mailOptions = (theEmail, subject, htmlContent) => {
  return {
    subject,
    from: `${config.email.auth.user}@your-email.com`,
    to: theEmail,
    text: 'koa2-builder',
    html: htmlContent,
  }
}

email.resetPwdSend = async (ejsData) => {
  const htmlContent = await renderResetPwdTemplateFile(ejsData)
  const subject = 'Password Reset'
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions(ejsData.email, subject, htmlContent), (err, info) => {
      if (err) {
        reject(err)
      } else {
        resolve(info)
      }
    })
  })
}

email.verifyEmailSend = async (ejsData) => {
  const htmlContent = await renderVerifyEmailTemplateFile(ejsData)
  const subject = 'Email Verification'
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions(ejsData.email, subject, htmlContent), (err, info) => {
      if (err) {
        reject(err)
      } else {
        resolve(info)
      }
    })
  })
}

module.exports = email
