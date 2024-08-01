/* eslint-disable camelcase */
module.exports.verifyMail = (newUser) => {
    const { name, email_reset_code, subject } = newUser

    const emailTemplate = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>${subject}</title>
            <style>
              /* Add your styles here */
              body {
                font-family: Arial, sans-serif;
                background-color: #262833;
                color: white;
                margin: 0;
                padding: 0;
              }
              p{
                color : #FFFFFF
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #232324;
              }
              .header {
                text-align: center;
                background-color: #3a85a5;
                border-radius: 7px;
                color: #fff;
                padding: 10px;
              }
              .content {
                padding: 20px;
              }
              .footer {
                text-align: center;
                padding: 10px;
                border-radius: 7px;
                background-color: #3a85a5;
                color: #fff;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <img
                src="cid:logo"
                style="
                  display: inline-block;
                  max-width: 100%;
                  height: auto;
                  vertical-align: middle;
                "
              />
              <div class="header">
                <p style="font-size:20px; font-weight:bold;">${subject}</p>
              </div>
              <div class="content">
                <p>Hello ${name},</p>
                <p>
                  Your are request to verify your email. Below is the email verification code for
                  your account:
                </p>
              </div>
              <div class="footer">
                <p>Thank you,<br />Your App Team</p>
              </div>
            </div>
          </body>
        </html>   
    `

    return emailTemplate
}