require('dotenv').config()
const express = require('express');
const app = express();
const moment = require('moment');
const PORT = process.env.PORT || 5000;
const dexcom = require('dexcom-share');
const chalk = require('chalk');
let allReadings = [];

app.use('/', (req, res, err) => {
  res.send(allReadings)
})

const changedNumber = allReadings => {
  if (allReadings.length >= 2) {
    let previousItem = allReadings[allReadings.length - 1].reading;
    let lastNumber = allReadings[allReadings.length - 2].reading;

    if (previousItem < lastNumber) {
      difference = `-${lastNumber - previousItem} ↘`;
    } else if (previousItem === lastNumber) {
      difference = `No change 🤙`;
    } else {
      difference = `+${previousItem - lastNumber} ↗`;
    }
  } else {
    difference = "Not Available";
  }

  return difference;
}

const fetchReadings = async () => {
  const dexcomUser = dexcom({
    username: process.env.USERNAME,
    password: process.env.PASSWORD
  })

  for await (const reading of dexcomUser) {
    allReadings.push({
      'reading': reading.Value,
      'time': moment(reading.Date).format('MMMM Do YYYY, h:mm:ss a')
    });
    showResults(allReadings);
  }
  
}

fetchReadings().catch(err => {
  console.error(err)
  process.exit(1)
})

const showResults = allReadings => {
  const lineBreak = '-----------------------------------'
  console.log(lineBreak);
  console.log(chalk.inverse(chalk.cyanBright('Last Reading:', chalk.white(chalk.bold(allReadings[allReadings.length - 1].reading)))));
  console.log(chalk.green('Timestamp:', allReadings[allReadings.length - 1].time));
  console.log(chalk.cyanBright('Last Change: ', changedNumber(allReadings)))
}

app.listen(PORT, () => {
  console.log(`listening on port: ${PORT}`)
})