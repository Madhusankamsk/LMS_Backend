require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");

const config = require("./config/config");

const server = express();
server.use(cors());
const serverPort = config.web_port;

// set routes
server.use("/api", require("./routes"));

// Database Connection initiation
const { isProduction } = config;
if (isProduction) {
    mongoose.connect(`${config.database}`, {
      // useUnifiedTopology: true,
      // useNewUrlParser: true,
    });
  } else {
    mongoose.connect(`${config.testDatabase}`, {
      // useUnifiedTopology: true,
      // useNewUrlParser: true,
    });
    mongoose.set("debug", true);
  }

  const httpServer = http.createServer(server);
// start server...
httpServer.listen(serverPort, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`HTTP server listening on port : ${serverPort}`);
  }
});

module.exports = server;