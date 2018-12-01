const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

const Sequelize = require('sequelize');
const sequelize = new Sequelize('ristra_sgr', 'ristra_sgr', 'x;O961{7nR}u', {
	host: 'ristra.co',
	dialect: 'mysql',
	operatorsAliases: false,

	pool: {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000,
	},
});
const port = 8080;

// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// app.options('*', cors());

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });


app.get('/', cors(), (req, res) => {
    console.log('get /');
    res.send('Hellooo World!')
    });
app.post('/', (req, res) => {
  console.log(req.body.number);
	res.send('hello post');
});
app.post('/data', (req, res) => {

  console.log('post body', req.body);
res.send(req.body);
});
app.get('/data', (req, res) => {
  console.log('get', req.body);
	res.sendStatus(200);
});
app.post('/email/', (req, res) => {
	res.send(JSON.stringify(req.body.email + '_'));
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
