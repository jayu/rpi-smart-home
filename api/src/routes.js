'use strict';
const http      = require('http');
const fs        = require('fs');
const path      = require('path');
const express   = require('express');
const querystring = require('querystring');
const {WS, filterInactiveClients, websocketClients, sendToAll}  = require('./ws')
const gpio      = require('./gpio')
const {parseBoolean} = require('./utils')
const {play, getTemp, monitorTemp} = require('./play_temperature')
const MusicPlayer = require('./lib/music_player.js')

const music_player = new MusicPlayer(path.join(__dirname, "res/music"));

monitorTemp()
setInterval(monitorTemp, 29*60*1000)

module.exports = () => {
    const api = express.Router();
    api.post('/temperature', (req, res) => {
       	getTemp().then((temperature) => {
            console.log(temperature);
            res.json({temperature : '' + temperature})
            play(temperature)
        })
    })
    api.get('/temperatureList', (req, res) => {
    	const tempList = {};
	tempList.temperatureList = JSON.parse(fs.readFileSync(path.join(__dirname, '../out/temp.json')));
	res.json(tempList);
    })
    api.post('/smallCoffee', (req, res) => {
        console.log('small coffee required');
        const pinName = 'smallCoffee'
        const pinNumber = gpio.pins[pinName]
        gpio.write(pinNumber, true)
        .then(() => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    gpio.write(pinNumber, false)
                    .then(resolve)
                }, 300)
            })
        })
        .then(() => {
            res.json({
                pin : {
                    name : pinName,
                    number : pinNumber,
                    msg : 'Coffee making started.'
                }
            })
        })
    })
    api.post('/bigCoffee', (req, res) => {
        const pinName = 'bigCoffee'
        const pinNumber = gpio.pins[pinName]
        gpio.write(pinNumber, true)
        .then(() => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    gpio.write(pinNumber, false)
                    .then(resolve)
                }, 300)
            })
        })
        .then(() => {
            res.json({
                pin : {
                    name : pinName,
                    number : pinNumber,
                    msg : 'Coffee making started.'
                }
            })
        })
    })
    api.get('/socket/:id', function (req, res) {
        const id = req.params.id;
        const pinName = `socket${id}`
        const pinNumber = gpio.pins[pinName]
        const pinState = gpio.state[pinNumber] 
        res.json({
            pin : {
                name : pinName,
                number : pinNumber,
                value : pinState
            }
        });
    });
    api.post('/socket/:id', function (req, res) {
        const id = req.params.id;
        const state = parseBoolean(req.query.state) || undefined
        const pinName = `socket${id}`
        const pinNumber = gpio.pins[pinName]
	console.log(pinNumber, state);
        gpio.write(pinNumber, state)
        .then(value => {
	    console.log('state changed', value);	
            sendToAll({type : 'STATE_CHANGED'});
            res.json({
                pin : {
                    name : pinName,
                    number : pinNumber,
                    value : value
                }
            });
        })
    });
    api.get('/setup', function (req, res) {
        const pins = {};
        Object.keys(gpio._pins.write).forEach((pinName) => {
            pins[pinName] = gpio.state[gpio._pins.write[pinName][0]];
        })
        const promises = [];
        Object.keys(gpio._pins.read).forEach((pinName) => {
            promises.push(
                gpio.read(gpio._pins.read[pinName])
                .then((value) => {
                    return {
                        pinName,
                        value,
                    }
                })
            )
        })
        Promise.all(promises)
        .then(_pins => {
            _pins.forEach(({pinName, value}) => {
                pins[pinName] = value
            })
            return pins
        })
        .then((pins) => {
            res.json({
                pins,
            });
        })
    });
    api.get('/musicPlayer/test', function (req, res) {
        music_player._getFileInfo('trap/YI - mowilas.mp3');
    });
    api.get('/musicPlayer/test2', function (req, res) {
        music_player._readMusicInfo()
        .then((info) => {
		console.log(info)
		res.json(info)
	})
    });
    api.ws('/', function(ws, req) {
        console.log('new ws connections');
        const socket = new WS(ws);
        ws.on('message', function(msg) {
            console.log(msg);
        });
        ws.on('close', function() {
            console.log("closed WS");
        })
        socket.sendJSON({test : 'test'});
        websocketClients.push(socket);
    });
    return api;
};
