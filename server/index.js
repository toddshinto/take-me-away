require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const ClientError = require('./client-error');
const path = require('path')

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public/')));

app.get('/api/geocode/:city', (req, res) => {
  const city = req.params.city;
  fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${process.env.GOOGLE_API_KEY}`)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      console.log(data.results);
      if (data.results.length > 0) {
        return res.status(200).send(data);
      } else {
        return res.status(500).json({error: 'unexpected error'})
      }
    })
    .catch(err => {
      res.status(500).json({ message: 'unexpected error' });
      console.error(err);
    });
});

app.get('/api/geonames/:lat1/:lon1/:lat2/:lon2', (req, res) => {
  const lat1 = req.params.lat1;
  const lon1 = req.params.lon1;
  const lat2 = req.params.lat2;
  const lon2 = req.params.lon2;
  fetch(`http://api.geonames.org/search?type=json&q=airport&featureCode=AIRP&west=${lon1}&north=${lat2}&east=${lon2}&south=${lat1}&username=toddshinto`)
    .then(result => result.json())
    .then(data => {
      return res.status(200).send(data);
    })
    .catch(err => {
      res.status(500).json({ message: 'unexpected error' });
      console.error(err);
    });
});

app.get('/api/health-check', (req, res) => {
  return res.status(200).json({ message: 'successful health check' });
});

app.use('/api', (req, res, next) => {
  next(new ClientError(`cannot ${req.method} ${req.originalUrl}`, 404));
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof ClientError) {
    res.status(err.status).json({ error: err.message });
  } else {
    console.error(err);
    res.status(500).json({
      error: 'an unexpected error occurred'
    });
  }
});

app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Now listening on port ${process.env.PORT}!`);
});
