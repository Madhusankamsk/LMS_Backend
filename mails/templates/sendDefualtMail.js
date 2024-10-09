/* eslint-disable camelcase */
module.exports.sendDefualtMail = (body) => {
    const { text, subject, name } = body;
  
    const sendDefualtMail = `
    <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${subject}</title>
      <!-- Include Google Fonts -->
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
      <style>
        /* Add your styles here */
        body {
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          border: 10px solid #FEC619; /* Yellow border */
          box-sizing: border-box;
        }
        .container {
          max-width: 600px;
          width: 100%;
          margin: 20px;
          padding: 20px;
          background-color: #fff;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
          border: 2px solid #FEC619;
          border-radius: 50px;
          text-align: center; /* Centers text and logo horizontally */
        }
        .logo {
          display: block;
          max-width: 100px; /* Adjust the size as needed */
          height: auto;
          margin: 0 auto 20px; /* Centers the logo and adds space below */
        }
        .content {
          padding: 20px;
          line-height: 1.6;
        }
        .highlight-container {
          background-color: #FEC619;
          border-radius: 5px;
          padding: 15px;
          text-align: center;
          position: relative;
        }
        .highlight {
          font-family: "Poppins", sans-serif;
          font-weight: 800;
          font-style: normal;
          color: #222222;
          font-size: 18px;
        }
        p {
          font-family: "Poppins", sans-serif;
          font-weight: 400;
          font-style: normal;
          color: #333333;
          padding: 10px;
          margin: 0 0 15px;
        }
        @media (max-width: 600px) {
          .container {
            padding: 10px;
          }
          .content {
            padding: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <img src="https://d1csarkz8obe9u.cloudfront.net/posterpreviews/iconic-black-and-yellow-logo-design-template-bc213d84eeaf10f0e635b8a246a62b69_screen.jpg?ts=1585344354" alt="Agora Maths Academy Logo" class="logo" />
        <div class="content">
          <p><b>Hello ${name},</b></p>
          <p>
            ${text}
          </p>
        </div>
        <div class="footer">
          <p>Thank you,<br />Agora Maths Academy</p>
        </div>
      </div>
    </body>
  </html>
    `;
  
    return sendDefualtMail;
  };