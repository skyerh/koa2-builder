const
  config = require('../config'),
  ejs = require('ejs'),
  email = {},
  nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: config.email.auth
})

/*
let readEmailTemplateFile = async () => {
  return new Promise ((resolve, reject) => {
    fs.readFile(__dirname + '/../views/email.ejs', 'utf8', (err, content) => {
      if (!err && content) {
        resolve(content)
      } else {
        reject(err)
      }
    })
  })
}
*/

let renderInvitationTemplateFile = (ejsData) => {
  return new Promise ((resolve, reject) => {
    ejs.renderFile(__dirname + '/../views/invitation.ejs', ejsData, (err, content) => {
      if (!err && content) {
        resolve(content)
      } else {
        reject(err)
      }
    })
  })
}

email.verify = async () => {
  return new Promise ((resolve, reject) => {
    transporter.verify((err, success) => {
      if (err) {
        reject(err)
      } else {
        resolve(success)
      }
    })
  })
}

let mailOptions = (email, htmlContent) => {
  return {
    from: `${config.email.auth.user}@email.com`,
    to: email,
    subject: 'Cloud Account Invitation',
    text: 'example',
    html: htmlContent
  }
}

email.invitationSend = async (ejsData) => {
  let htmlContent = await renderInvitationTemplateFile(ejsData)
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
  return new Promise ((resolve, reject) => {
      
    transporter.sendMail(mailOptions(ejsData.email, htmlContent), (err, info) => {
      if (err) {
        reject(err)
      } else {
        resolve(info)
      }
    })
  })
}

module.exports = email