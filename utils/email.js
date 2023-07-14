const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1) Create a transporter
  let mailTransporter = nodemailer.createTransport({
    // service: "gmail",
    // auth: {
    //   user: "ektaittech@gmail.com",
    //   pass: "ociamuhselcbypvi",
    // },
    host: "smtp.hostinger.com",
    port: 587,
    secure: false,
    auth: {
      user: "info@riskstifle.ca",
      pass: "Amandeep@12",
    },
    connectionTimeout: 10000,
  });

  // 2) Define the email options
  let mailOptions = {
    from: "info@riskstifle.ca",
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // 3) Actually send the email
  try {
    const data = await mailTransporter.sendMail(mailOptions);
  } catch (error) {
    console.log("api error ====", error);
  }
};

module.exports = sendEmail;
