/* eslint-disable camelcase */
module.exports.forgotPassword = (user) => {
    const { name, password_reset_code, subject } = user
  
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
                background-color: #262833 !important;
                color: white;
                margin: 0;
                padding: 0;
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
              p{
                color : #FFFFFF
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
              <div class="header">
                 <p style="font-size:20px; font-weight:bold;">${subject}</p>
              </div>
              <div class="content">
                <p>Hello ${name},</p>
                <p>
                  We received a request to reset your password. Please use the following
                  code to reset your password:
                </p>
                <p><strong>${password_reset_code}</strong></p>
                <p>
                  If you did not request a password reset, please ignore this email.
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