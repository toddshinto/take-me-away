require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const rateLimit = require("express-rate-limit");
var cors = require("cors");
const app = express();
const port = 3000;

const limiter = rateLimit({
  windowMs: 1000,
  max: 1,
});

app.use(limiter);
app.use(cors());

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

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
