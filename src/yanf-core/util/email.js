const Mailgun = require('mailgun-js');

const { mailGun: { apiKey, domain, fromEmail } } = require('../config');

const mailgun = new Mailgun({ apiKey, domain });

function sendMail({ email, subject, content }) {
  const data = {
    from: fromEmail,
    to: email,
    subject,
    html: content
  };

  return mailgun.messages().send(data);
}

module.exports = {
  sendMail
};
