// eslint-disable-next-line import/no-extraneous-dependencies
const sgMail = require("@sendgrid/mail");

const { createUser } = require("./templates/create-user-email");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);