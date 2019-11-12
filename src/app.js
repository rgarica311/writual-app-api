require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const anatomyRouter = require('./anatomy-router')
const catRouter = require('./cat-router')
const frameworksRouter = require('./frameworks-router')
const heroRouter = require('./hero-router')

const app = express()

app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common', {
  skip: () => NODE_ENV === 'test'
}))

app.use(cors())
app.use(helmet())
app.use(anatomyRouter);
app.use(catRouter);
app.use(frameworksRouter);
app.use(heroRouter);

app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === 'production') {
    response = {error: {message: 'server error'}};
  } else {
    response = {error};
  }
  res.status(500).json(response);
});

module.exports = app;
