const mongoose = require('mongoose');
const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('morgan');
const Data = require('./db/data');
const path = require('path');

const API_PORT = process.env.PORT || 8000;
const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, "client", "build")))

const router = express.Router();
// this is our MongoDB database
const user = process.env.MONGO_USER
const pw = process.env.MONGO_PASSWORD
const dbRoute = 'mongodb+srv://' + user + ':' + pw + '@slack-slash-fz3mh.mongodb.net/test?retryWrites=true';

// connects our back end code with the database
mongoose.connect(
  dbRoute,
  { useNewUrlParser: true }
);

let db = mongoose.connection;

db.once('open', () => console.log('connected to the database'));

// checks if connection with the database is successful
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// (optional) only made for logging and
// bodyParser, parses the request body to be a readable json format
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));

// this is our get method
// this method fetches all available data in our database
router.get('/api/getData', (req, res) => {
  Data.find((err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  });
});

// this is our update method
// this method overwrites existing data in our database
router.post('/api/updateData', (req, res) => {
  const { id, update } = req.body;
  Data.findOneAndUpdate(id, update, err => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

// this is our delete method
// this method removes existing data in our database
router.delete('/api/deleteData', (req, res) => {
  const { id } = req.body;
  Data.findOneAndDelete(id, err => {
    if (err) return res.send(err);
    return res.json({ success: true });
  });
});

// this is our create methid
// this method adds new data in our database
router.post('/api/putData', (req, res) => {
  let data = new Data();

  const { id, message } = req.body;

  if ((!id && id !== 0) || !message) {
    return res.json({
      success: false,
      error: 'INVALID INPUTS'
    });
  }
  data.message = message;
  data.id = id;
  data.save(err => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

// this is our convert method
router.post('/api/lmgtfy_convert', (req, res) => {
  const { text, token } = req.body;
  if (token === process.env.SLACK_TOKEN) {
    return res.json({
      response_type: 'in_channel',
      text: `http://lmgtfy.com/?q=${text}`,
    });
  } else {
    return res.json({
      success: false,
      error: 'INVALID TOKEN',
    });
  }
});

app.use(router);

// Serve up React frontend for all other requests
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

// launch our backend into a port
app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));
