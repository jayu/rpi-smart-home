const fs = require('fs');
const path = require('path')
const { spawn, exec } = require('child_process')
const { SoundPlayer } = require('./sound_player.js')
const { TaskQueue } = require('./utils.js')
const mp3Length = require('mp3-length');

const { WS, filterInactiveClients, websocketClients, sendToAll } = require('../ws')


/* 
	
  - stop current playlis when changes check it
*/


class MusicPlayer {
  constructor(sourceDir) {
    //this.soundPlayer = soundPlayer;
    this.sourceDir = sourceDir;
    this.musicInfo = {};
    this.queue = [];
    this.currentQueueIndex = 0;
    this.currentSoundStart = 0;
    this.currentSoundPausedAt = 0;
    this.currentSound = {};
    this.shuffle = true;
    this.repeat = true //false;
    this.getFileInfoTaskQueue = new TaskQueue((songPath) => {
      return new Promise((resolve, reject) => {
        if (require('os').userInfo().username != "ASUS") {
          mp3Length(songPath, (err,duration) => {
            console.log(songPath, err, duration)
            resolve(duration)
          })
        }
        else {
          resolve(3)
        }
      })
    }, 'getFileInfo')
    this._readMusicInfo()
      .then((musicInfo) => {
        this.musicInfo = musicInfo
        console.log('musicInfo', musicInfo)
      })
	.catch((err) => {console.log(err)})
  }
  
  _getFileInfo(playlist, name) {
    const self = this;
    return new Promise((resolve, reject) => {
      const filePath = path.join(this.sourceDir, playlist, name)
      this.getFileInfoTaskQueue.add(filePath, (duration) => {
        resolve({
          name,
          duration : duration*1000,
          path: filePath
        })
      })
    })
  }
  _readMusicInfo() {
    const self = this
    const playlists = fs.readdirSync(this.sourceDir).filter((playlist) => {
        	return fs.statSync(path.join(this.sourceDir, playlist)).isDirectory()
        })
    return Promise.all(
        playlists
        .map((playlist) => {
        	console.log(playlist)
          const songs = fs.readdirSync(path.join(self.sourceDir, playlist))
          return Promise.all(songs.map((song) => {
              return self._getFileInfo(playlist, song)
            }))
            .then((songsInfo) => {
              console.log(songsInfo)
              return songsInfo
            })
        }))
      .then((music) => {
        const musicInfo = {
          playlists: {}
        }
        for (let i = 0; i < music.length; i++) {
          musicInfo.playlists[playlists[i]] = music[i]
        }
        return musicInfo
      })
  }
  getMusicInfo() {
    return this.musicInfo;
  }
  _setQueue(songs) {
    this.currentQueueIndex = 0;
    this.currentSoundStart = 0;
    this.currentSoundPausedAt = 0;
    this.queue = songs;
  }
  _setCurrentSound(currentSound) {
    console.log('currentSound', currentSound)
    sendToAll({ type: 'SONG_NAME_CHANGED', name : this.queue[this.currentQueueIndex].name });
    this.currentSound = currentSound;
    this.currentSoundStart = Date.now()
    return currentSound.endPromise
  }
  _setNextSongIndex() {
    this.currentSoundPausedAt = 0;
    if (this.shuffle) { 
      this.currentQueueIndex = ~~(this.queue.length * Math.random())
    } else if (this.repeat && this.currentQueueIndex == this.queue.length - 1) {
      this.currentQueueIndex = 0;
    } else {
      this.currentQueueIndex++;
    }
  }
  _setPrevSongIndex() {
    this.currentSoundPausedAt = 0;
    if (this.shuffle) { 
      this.currentQueueIndex = this.currentQueueIndex // just for readability
    } else if (this.repeat && this.currentQueueIndex == 0) {
      this.currentQueueIndex = this.queue.length - 1
    } else {
      this.currentQueueIndex--;
    }
  }
  _playbackEnd(code) {
    console.log('playback end', code)
    if (code == 'end') {
      this._setNextSongIndex()
      if (this.currentQueueIndex >= 0 && this.currentQueueIndex < this.queue.length) {
        this._playQueue()
      }
    }
  }
  _playQueue() { // recursive playing songs from playQueue
    this.currentSoundPausedAt = 0;
    SoundPlayer.play(this.queue[this.currentQueueIndex].path)
      .then(this._setCurrentSound.bind(this))
      .then(this._playbackEnd.bind(this))
  }
  play(args) {
    if (args.playlist) { // one song per one SoundPlayer.play - allow other sounds ex. system info be played between songs
      //once the song finished, promise is resolved and next song is playing
      // here just create playQueue of songs and fire _playQueue
      this.stop()
      let currentPlayList = [...this.musicInfo.playlists[args.playlist]]
      if (args.songName) {
        const i = currentPlayList.findIndex((song) => {
          return args.songName == song.name
        })
        currentPlayList = currentPlayList.splice(i).concat(currentPlayList) // move songs from chosen song to last one at the begining
        console.log(currentPlayList)
      }
      this._setQueue(currentPlayList)

      if (args.songName == undefined && this.shuffle) {
        this.currentQueueIndex = ~~(this.queue.length * Math.random())
      }

      if (this.queue.length > 0) {
        this._playQueue();
      }

    }
  }
  pause() { 
    this.currentSoundPausedAt = this.currentSoundPausedAt + Date.now() - this.currentSoundStart // previous paused + interval
    this.stop()
  }
  resume() {
    const song = [this.queue[this.currentQueueIndex].path, 'trim', ~~(this.currentSoundPausedAt/1000)]
    SoundPlayer.play(song)
      .then(this._setCurrentSound.bind(this))
      .then(this._playbackEnd.bind(this))
  }
  stop() { //kill current song
    console.log('killing current song', this.currentSound)
    if (this.currentSound.kill) {
      this.currentSound.kill();
    }
  }
  next() {
    this._setNextSongIndex()
    this.currentSound.replace(this.queue[this.currentQueueIndex].path)
      .then(this._setCurrentSound.bind(this))
      .then(this._playbackEnd.bind(this))
  }
  prev() {
  	this._setPrevSongIndex()
    this.currentSound.replace(this.queue[this.currentQueueIndex].path)
      .then(this._setCurrentSound.bind(this))
      .then(this._playbackEnd.bind(this))
  }
  setRepeat(repeat) {
  	this.repeat = !!repeat
  }
  setShuffle(shuffle) {
  	this.shuffle = !!shuffle
  }
  setVolume(volume) {
    return SoundPlayer.setVolume(volume)
  }
}
module.exports = MusicPlayer;
