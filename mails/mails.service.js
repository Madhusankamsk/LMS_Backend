// eslint-disable-next-line import/no-extraneous-dependencies
const config = require("../config/config");
const nodemailer = require("nodemailer");

const { createUser } = require("./templates/createUserEmail");
const { forgotPassword } = require("./templates/forgotPasswordEmail");
const { verifyMail } = require("./templates/verifyMail");
const { sendDefualtMail } = require("./templates/sendDefualtMail");

const logoAttachment = {
    filename: "logo.jpg",
    content: config.logoImage,
    contentType: "image/png",
    content_id: "logo",
    disposition: "inline",
};

async function sendMail(msg) {

    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,

        secure: false, 
        requireTLS: true,
        auth: {
            user: process.env.NODEMAILER_EMAIL, 
            pass: process.env.NODEMAILER_PASSWORD, 
        },
    });

    await transporter.sendMail(msg);
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

module.exports.forgotPassword = async (body) => {
    const msg = {
        to: body.to,
        from: process.env.NODEMAILER_EMAIL,
        subject: body.subject,
        html: forgotPassword(body),
        attachments: [logoAttachment],
    };

    await sendMail(msg);
};

module.exports.verifyMail = async (body) => {
    const msg = {
        to: body.to,
        from: process.env.NODEMAILER_EMAIL,
        subject: body.subject,
        html: verifyMail(body),
        attachments: [logoAttachment],
    };

    await sendMail(msg);
};

module.exports.sendDefualtMail = async (body) => {
    const msg = {
        to: body.to,
        from: process.env.NODEMAILER_EMAIL,
        subject: body.subject,
        html: verifyMail(body),
        attachments: [logoAttachment],
    };

    await sendMail(msg);
};




