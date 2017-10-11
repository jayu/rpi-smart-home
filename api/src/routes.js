'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const querystring = require('querystring');
const { WS, filterInactiveClients, websocketClients, sendToAll } = require('./ws')
const gpio = require('./gpio')
const { parseBoolean } = require('./utils')
const { play, getTemp, monitorTemp } = require('./play_temperature')
const MusicPlayer = require('./lib/music_player.js')

const { downloadFromYoutube, updateSpotifySongs } = require('./lib/youtubify.js')

const music_player = new MusicPlayer(path.join(__dirname, "res/music"));

monitorTemp()
setInterval(monitorTemp, 29 * 60 * 1000)

module.exports = () => {
  const api = express.Router();
  api.post('/temperature', (req, res) => {
    getTemp().then((temperature) => {
      console.log(temperature);
      res.json({ temperature: '' + temperature })
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
          pin: {
            name: pinName,
            number: pinNumber,
            msg: 'Coffee making started.'
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
          pin: {
            name: pinName,
            number: pinNumber,
            msg: 'Coffee making started.'
          }
        })
      })
  })
  api.get('/socket/:id', function(req, res) {
    const id = req.params.id;
    const pinName = `socket${id}`
    const pinNumber = gpio.pins[pinName]
    const pinState = gpio.state[pinNumber]
    res.json({
      pin: {
        name: pinName,
        number: pinNumber,
        value: pinState
      }
    });
  });
  api.post('/socket/:id', function(req, res) {
    const id = req.params.id;
    const state = parseBoolean(req.query.state) || undefined
    const pinName = `socket${id}`
    const pinNumber = gpio.pins[pinName]
    console.log(pinNumber, state);
    gpio.write(pinNumber, state)
      .then(value => {
        console.log('state changed', value);
        sendToAll({ type: 'STATE_CHANGED' });
        res.json({
          pin: {
            name: pinName,
            number: pinNumber,
            value: value
          }
        });
      })
  });
  api.get('/setup', function(req, res) {
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
        _pins.forEach(({ pinName, value }) => {
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
  api.get('/musicPlayer/test', function(req, res) {
    music_player._getFileInfo('trap/YI - mowilas.mp3');
  });
  api.get('/musicPlayer/test2', function(req, res) {
    music_player._readMusicInfo()
      .then((info) => {
        console.log(info)
        res.json(info)
      })
  });
  api.post('/musicPlayer/play', function(req, res) {
    music_player.play({
      playlist: req.body.playlist,
      songLike: req.body.songLike,
      song: req.body.song
    })
    res.send('done')
  })
  api.post('/musicPlayer/pause', function(req, res) {
    music_player.pause()
    res.send('done')
  })
  api.post('/musicPlayer/resume', function(req, res) {
    music_player.resume()
    res.send('done')
  })
  api.post('/musicPlayer/stop', function(req, res) {
    music_player.stop()
    res.send('done')
  })
  api.post('/musicPlayer/prev', function(req, res) {
    music_player.prev()
    res.send('done')
  })
  api.post('/musicPlayer/next', function(req, res) {
    music_player.next()
    res.send('done')
  })
  api.post('/musicPlayer/setVolume', function(req, res) {
    music_player.setVolume(req.body.volume)
    res.send('done')
  })

  api.get('/videoTest', function(req, res) {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end('<video src="http://192.168.8.100:3000/api/piki.mp4" controls></video>');
  })
  api.get('/piki.mp4', function(req, res) {
    //res.writeHead(200, {'Content-type' : 'video/mp4'})
    const filepath = path.join(__dirname, 'res/piki.mp4');
    const stat = fs.statSync(filepath)
    const fileSize = stat.size
    const range = req.headers.range
    if (range) {
      console.log('range')
      const parts = range.replace(/bytes=/, "").split("-")
      const start = parseInt(parts[0], 10)
      const end = parts[1] ?
        parseInt(parts[1], 10) :
        fileSize - 1
      const chunksize = (end - start) + 1
      const file = fs.createReadStream(filepath, { start, end })
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      }
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      console.log('no range')
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      }
      res.writeHead(200, head)
      fs.createReadStream(filepath).pipe(res)
    }
  })
  api.get('/youtube/:id', function(req, res) {
    downloadFromYoutube(req.params.id, 'tewt', res)
  })
  api.get('/updateSpotify', function(req, res) {
    const toOmmit = [
      'Uro Martynki',
      'Afternoon Train Ride',
      'Emotron',
      'deep Chill',
      'kartka',
      'Reading Soundtrack',
      'car rollin',
      'russ Hip-Hop',
      'Holidays',
      'Hip-Hop & R&B',
      'Bedoes'
    ]
    updateSpotifySongs('11156868367', toOmmit, path.join(__dirname, 'res/music'))
    res.send('done');
  })
  api.ws('/', function(ws, req) {
    console.log('new ws connections');
    const socket = new WS(ws);
    ws.on('message', function(msg) {
      console.log(msg);
    });
    ws.on('close', function() {
      console.log("closed WS");
    })
    socket.sendJSON({ test: 'test' });
    websocketClients.push(socket);
  });
  return api;
};