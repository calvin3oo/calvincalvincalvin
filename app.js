const express = require('express');
require('dotenv').config()
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger_output.json')
const swaggerAutogen = require('swagger-autogen')()
const outputFile = './swagger_output.json'
const endpointsFiles = ['./app.js']

swaggerAutogen(outputFile, endpointsFiles)

const app = express();
const port = process.env.PORT || 80;


app.get('/', (req, res) => {
  res.send('Hello World!');
});


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile))


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});