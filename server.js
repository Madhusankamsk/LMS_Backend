// require("dotenv").config();
// const cors = require("cors");
// const express = require("express");
// const mongoose = require("mongoose");
// const http = require("http");
// const  CronJob = require("cron");


// const config = require("./config/config");

// const server = express();
// server.use(cors());
// const serverPort = config.web_port;

// // set routes
// server.use("/api", require("./routes"));

// // Database Connection initiation
// const { isProduction } = config;
// if (isProduction) {
//     mongoose.connect(`${config.database}`, {
//       // useUnifiedTopology: true,
//       // useNewUrlParser: true,
//     });
//   } else {
//     mongoose.connect(`${config.testDatabase}`, {
//       // useUnifiedTopology: true,
//       // useNewUrlParser: true,
//     });
//     mongoose.set("debug", true);
//   }

//   const httpServer = http.createServer(server);
// // start server...
// httpServer.listen(serverPort, (err) => {
//   if (err) {
//     console.error(err);
//   } else {
//     console.log(`HTTP server listening on port : ${serverPort}`);
//   }
// });

// module.exports = server;


require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const CronJob = require("cron").CronJob;

const config = require("./config/config");

const server = express();
server.use(cors());
const serverPort = config.web_port;

// set routes
server.use("/api", require("./routes"));

// Database Connection initiation
const { isProduction } = config;
if (isProduction) {
    mongoose.connect(`${config.database}`)
      .then(() => console.log("Connected to production database"))
      .catch((err) => console.error("Production DB connection error:", err));
} else {
    mongoose.connect(`${config.testDatabase}`)
      .then(() => console.log("Connected to test database"))
      .catch((err) => console.error("Test DB connection error:", err));
    
    mongoose.set("debug", true); // Enable mongoose debug mode in non-production
}

const httpServer = http.createServer(server);

// Start server
httpServer.listen(serverPort, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`HTTP server listening on port : ${serverPort}`);
  }
});

// Set up a cron job to print "Hello, World" every 1 minute
const printHelloWorldJob = new CronJob('*/5 * * * *', function() {
  console.log("Hello, World");
});

// Start the cron job
printHelloWorldJob.start();

module.exports = server;

