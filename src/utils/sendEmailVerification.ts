import nodemailer from "nodemailer";

import User from "../models/UserModel";

export const sendEmailVerification = async (to: string, link: string) => {
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  let user = await User.findOne({ _id: to }, "email");

  let info;
  try {
    info = await transporter.sendMail({
      from: `"Fred Foo 👻" <${testAccount.user}>`, // sender address
      to: `${user?.email}`, // list of receivers
      subject: "Verify your email ✔", // Subject line
      text: "Click the link to verify your account", // plain text body
      html: `<p>Please click the following link to verify your email address:</p>
        <p><a href="${link}">${link}</a></p>`, // html body
    });

    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    console.log("Message sent: %s", info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error: any) {
    throw new Error(error);
  }
};
