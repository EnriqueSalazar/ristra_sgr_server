const express = require('express');
const fs = require('fs');

const readline = require('readline');

const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const credentials = require('./googleCredentials');
const Sequelize = require('sequelize');
const sequelize = new Sequelize('ristra_sgr', 'ristra_sgr', 'x;O961{7nR}u', {
	host: 'ristra.co',
	dialect: 'mysql'
});
const port = 8080;

const {google} = require('googleapis');

app.use(bodyParser.json());
app.use(cors());

app.get('/', cors(), (req, res) => {
    console.log('get /');
    res.send('Hellooo World!')
    });
app.post('/', (req, res) => {
  console.log(req.body.number);
	res.send('hello post');
});
// app.post('/data', (req, res) => {
//   console.log('post body', req.body);
// res.send(req.body);
// });

const Questionario = sequelize.define('questionario', {
  by: Sequelize.STRING,
  data: Sequelize.STRING
});


const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

const TOKEN_PATH = 'token.json';

app.post('/data', (req, res) => {
	console.dir(credentials);
  console.log('post data', req.body);
  sequelize.sync()
  .then(() => Questionario.create({
    by: req.body.email,
	data: JSON.stringify(req.body)
  }))
  .then(questionario => {
    console.log(questionario.toJSON());
    
    authorize(credentials, listMajors);

	res.send(questionario.toJSON());
  });
});
app.post('/email/', (req, res) => {
	res.send(JSON.stringify(req.body.email + '_'));
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listMajors(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.get({
    spreadsheetId: '1lTE8PfFQIlOARtFybI3a8FlXyV8wixTVPtNi_Awuzw0',
    range: 'Hoja 1!A1:B',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
      console.log('Name, Major:');
      // Print columns A and E, which correspond to indices 0 and 4.
      rows.map((row) => {
        console.log(`${row[0]}, ${row[1]}`);
      });
    } else {
      console.log('No data found.');
    }
  });
}