require('dotenv').config();
const express = require("express");
const fetch = require("node-fetch");
const rateLimit = require("express-rate-limit");
const staticMiddleware = require('./static-middleware')
var cors = require("cors");
const app = express();

const limiter = rateLimit({
  windowMs: 1000,
  max: 1,
});

app.use(limiter);
app.use(cors());
app.use(staticMiddleware)

app.get("/", (req, res) => res.send("Hello World!"));

app.get("/api/geocode/:city", (req, res) => {
    const city = req.params.city;
    fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${process.env.GOOGLE_API_KEY}`)
      .then(result => result.json())
      .then(data => {
        return res.status(200).send(data)
      })
      .catch(err => {
        res.status(500).json({message: 'unexpected error'});
        console.error(err);
      });
});

app.get("/api/geonames/:lat1/:lon1/:lat2/:lon2", (req, res) => {
  const lat1 = req.params.lat1;
  const lon1 = req.params.lon1;
  const lat2 = req.params.lat2;
  const lon2 = req.params.lon2;
  console.log(req.parmas)
  console.log(lat1, lon1, lat2, lon2)
  console.log(`http://api.geonames.org/search?type=json&q=airport&featureCode=AIRP&west=${lon1}&north=${lat2}&east=${lon2}&south=${lat1}&username=toddshinto`)
  fetch(`http://api.geonames.org/search?type=json&q=airport&featureCode=AIRP&west=${lon1}&north=${lat2}&east=${lon2}&south=${lat1}&username=toddshinto`)
    .then(result => result.json())
    .then(data => {
      return res.status(200).send(data)
    })
    .catch(err => {
      res.status(500).json({ message: 'unexpected error' });
      console.error(err);
    });
})

app.get('/api/health-check', (req, res) => {
  return res.status(200).json({message: 'successful health check'})
});

app.listen(process.env.PORT, () => console.log(`Example app listening on port ${process.env.PORT}!`));
