'use strict';

const express = require('express');
const morgan = require('morgan');
// this will load our .env file if we're
// running locally. On Gomix, .env files
// are automatically loaded.
require('dotenv').config();
const {sendEmail} =  require('./emailer');

const {logger} = require('./utilities/logger');
// these are custom errors we've created
const {FooError, BarError, BizzError} = require('./errors');

const app = express();

// this route handler randomly throws one of `FooError`,
// `BarError`, or `BizzError`
const russianRoulette = (req, res) => {
  const errors = [FooError, BarError, BizzError];
  throw new errors[
    Math.floor(Math.random() * errors.length)]('It blew up!');
};





app.use(morgan('common', {stream: logger.stream}));

// for any GET request, we'll run our `russianRoulette` function
app.get('*', russianRoulette);
//console.log(russianRoulette);
// YOUR MIDDLEWARE FUNCTION should be activated here using
// `app.use()`. It needs to come BEFORE the `app.use` call
// below, which sends a 500 and error message to the client
//app.use(sendEmail);

//1-check which error is returned from russian roulette
//2-sendEmail if foo or bar error occur
//2.5-include err.message and err.stack
//3-if bizz error go to next();
const checkForError = (err, req, res, next) => {
  if(err instanceof FooError || err instanceof BarError) {
    const emailData =
{
 from: process.env.ALERT_FROM_NAME,
 to: process.env.ALERT_TO_EMAIL,
 subject: `ALERT: a ${err.name} occurred`,         
 text: err.message,
 html: `<h1>${err.message}</h1><p>${err.stack}</p>`
};
    console.log(emailData);
    sendEmail(emailData);
  }  
  next();
};

app.use(checkForError);

app.use((err, req, res, next) => {
  //console.log(err);
  //res.checkForError(russianRoulette);
  logger.error(err);
  res.status(500).json({error: 'Something went wrong'}).end();
});

const port = process.env.PORT || 8081;

const listener = app.listen(port, function () {
  logger.info(`Your app is listening on port ${port}`);
});
