// swagger.js
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TODO API",
      version: "0.0.1_BETA",
      description: "A simple API for managing todos",
    },
    servers: [
      {
        url: "http://localhost:8000/api/v1",
        description: "Development server",
      },
    ],
  },
  apis: ["./app.js"], // Or wherever your route definitions live
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
