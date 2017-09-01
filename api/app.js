'use strict';

/* DEPENDENCIES */
const http        = require('http'),
      fs          = require('fs'),
      path        = require('path'),
      express     = require('express'),
      bodyParser  = require('body-parser'),
      env         = process.env,
      //ObjectID    = require('mongodb').ObjectID,
      //MongoClient = require('mongodb').MongoClient,
      cors = require('cors'),
      //mongoose = require('mongoose'),
      fileUpload = require('express-fileupload'),
      app = express(),
      expressWs = require('express-ws')(app),
      {ip} = require('./src/utils'),
      lcd = require('./src/lib/lcd');

/* CONFIG */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(fileUpload());
app.use(cors());
app.use(express.static(path.join(__dirname, '../app/build')));

/* APP ROUTING */

app.use('/api', require('./src/routes.js')());


/* BOOT */

let port = env.NODE_PORT || 3000;
let _ip = env.NODE_IP || ip()[0] || 'localhost'// '192.168.8.107';

app.listen(port, _ip , () => {
    console.log(`Smart Home is running at: http://${_ip}:${port}/`)
    lcd.init(() => {
	console.log('LCD initialized')
      lcd.writeString([`${_ip}:${port}`])
    })
});
