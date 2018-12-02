const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

const Sequelize = require('sequelize');
const sequelize = new Sequelize('ristra_sgr', 'ristra_sgr', 'x;O961{7nR}u', {
	host: 'ristra.co',
	dialect: 'mysql'
});
const port = 8080;

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

app.post('/data', (req, res) => {
  console.log('post data', req.body);
  sequelize.sync()
  .then(() => Questionario.create({
    by: req.body.email,
	data: JSON.stringify(req.body)
  }))
  .then(questionario => {
    console.log(questionario.toJSON());
	res.send(questionario.toJSON());
  });
});
app.post('/email/', (req, res) => {
	res.send(JSON.stringify(req.body.email + '_'));
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
