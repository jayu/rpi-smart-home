'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const { WS, filterInactiveClients, websocketClients, sendToAll } = require('../ws')

const MusicPlayer = require('../lib/music_player.js')

const { downloadFromYoutube, updateSpotifySongs } = require('../lib/youtubify.js')

const music_player = new MusicPlayer(path.join(__dirname, "../res/music"));


module.exports = () => {
  const musicPlayer = express.Router();
  musicPlayer.post('/play', function(req, res) {
    music_player.play({
      playlist: req.body.playlist,
      songName: req.body.songName,
      //song: req.body.song
    })
    res.send('done')
  })
  musicPlayer.post('/pause', function(req, res) {
    music_player.pause()
    res.send('done')
  })
  musicPlayer.post('/resume', function(req, res) {
    music_player.resume()
    res.send('done')
  })
  musicPlayer.post('/stop', function(req, res) {
    music_player.stop()
    res.send('done')
  })
  musicPlayer.post('/prev', function(req, res) {
    music_player.prev()
    res.send('done')
  })
  musicPlayer.post('/next', function(req, res) {
    music_player.next()
    res.send('done')
  })
  musicPlayer.post('/setVolume', function(req, res) {
    music_player.setVolume(req.body.volume)
    res.send('done')
  })
  musicPlayer.post('/setShuffle', function(req, res) {
    music_player.setShuffle(req.body.shuffle)
    res.send('done')
  })
  musicPlayer.post('/setRepeat', function(req, res) {
    music_player.setRepeat(req.body.repeat)
    res.send('done')
  })
  musicPlayer.get('/updateSpotify', function(req, res) {
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
  musicPlayer.get('/musicInfo', (req, res) => {
    res.json(music_player.musicInfo)
  })
  musicPlayer.get('/setup', (req, res) => {
    console.log(music_player)
    res.json({
      volume : music_player.getVolume(),
      shuffle : music_player.shuffle,
      repeat : music_player.repeat,
      songName : music_player.getCurrentSongName(),
      playbackState : music_player.playbackState
    })
  })
  return musicPlayer;
};