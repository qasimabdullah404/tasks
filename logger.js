const fs = require("fs");
const path = require("path");
const { createLogger, format, transports } = require("winston");

const logDir = "logs";

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "logs/app.log" })
  ]
});

module.exports = logger;
