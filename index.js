require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require("mongoose");
const dns = require("dns");
const bodyParser = require("body-parser");
const url = require("url");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true, useUnifiedTopology: true
});

const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});

let Url = mongoose.model("Url", urlSchema);

const createAndSaveUrl = (Url) => {
  Url.save()
    .catch((err) => {
      console.error(err);
    })
}

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


app.post("/api/shorturl", (req, res) => {
  let original = req.body.url;
  const check = dns.lookup(new URL(original).hostname, (err, address) => {
    if (err) {
      res.json({ error: "invalid url" })
    } else {
      let newUrl = new Url({
        original_url: original,
        short_url: Math.floor(Math.random() * 10000)
      });
      createAndSaveUrl(newUrl);
      console.log('address: %j', address);
      res.json({ original_url: original, short_url: newUrl.short_url })
    }
  })
});

app.get("/api/shorturl/:url", (req, res) => {
  Url.findOne({short_url: req.params.url})
    .then((data)=> {
      res.redirect(data.original_url);
  })
    .catch((err) => {
      console.error(err);
    })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

