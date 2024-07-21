// eslint-disable-next-line import/no-extraneous-dependencies
const sgMail = require("@sendgrid/mail");
const config = require("../config/config");
const nodemailer = require("nodemailer");

const { createUser } = require("./templates/createUserEmail");
// sgMail.setApiKey(process.env.NODEMAILER_PASSWORD);

const logoAttachment = {
    filename: "logo.jpg",
    content: config.logoImage,
    contentType: "image/png",
    content_id: "logo",
    disposition: "inline",
};




async function sendMail(msg) {
    //console.log("Mailer function called");

    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,

        secure: false, // true for 465, false for other ports
        requireTLS: true,
        auth: {
            user: process.env.NODEMAILER_EMAIL, // generated ethereal user
            pass: process.env.NODEMAILER_PASSWORD, // generated ethereal password
        },
    });

    let info = await transporter.sendMail(msg);

    // console.log("Message sent: %s", info.messageId);
    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

module.exports.createUserMail = async (body) => {
    const msg = {
        to: body.to,
        from: process.env.NODEMAILER_EMAIL,
        subject: body.subject,
        html: createUser(body),
        attachments: [logoAttachment],
    };

    await sendMail(msg);
};