const fs = require('fs');
const path = require('path')
const { spawn, exec } = require('child_process')
const { SoundPlayer } = require('./sound_player.js')
const mp3Duration = require('mp3-duration');


/* 
	co z przewijaniem, co z czasem piosenki ? 
	 - czytanie postępu z output streamu lub na początek ustawienie timeoutu po odczytaniu danych (czasu trwania) piosenki ?
	 - (?) odpalanie z określonym czasem
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
    this.currnetSong = {};
    this.shuffle = true;
    this.repeat = true //false;
    this._readMusicInfo()
      .then((musicInfo) => {
        this.musicInfo = musicInfo
      })
	.catch((err) => {console.log(err)})
  }
  
  _getFileInfo(playlist, name) {
    const self = this;
    return new Promise((resolve, reject) => {
      const filePath = path.join(this.sourceDir, playlist, name)
      
      mp3Duration(filePath, function (err, duration) {
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
    this.queue = songs;
  }
  _setCurrentSound(currentSound) {
    this.currentSound = currentSound;
    this.currentSoundStart = Date.now()
    console.log('currentSound', currentSound)
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
    SoundPlayer.play(this.queue[this.currentQueueIndex])
      .then(this._setCurrentSound.bind(this))
      .then(this._playbackEnd.bind(this))
  }
  play(args) {
    // args = {
    // 	playlist : '', // playlist id
    // 	song : '', // song id
    // 	songLike : '', // string 
    // }
    console.log(args);
    //console.log(this.musicInfo)
    if (args.playlist) { // one song per one SoundPlayer.play - allow other sounds ex. system info be played between songs
      //once the song finished, promise is resolved and next song is playing
      // here just create playQueue of songs and fire _playQueue
      this._setQueue(this.musicInfo.playlists[args.playlist].map((song) => (song.path)))
      if (this.queue.length > 0) {
        this._playQueue();
      }

    }
  }
  pasue() { 
    this.currentSoundPausedAt = this.currentSoundPausedAt + Date.now() - this.currentSoundStart // previous paused + interval
  }
  resume() {
    const song = [this.queue[this.currentQueueIndex], 'trim', ~~(this.currentSoundPausedAt/1000)]
    this.currentSound.replace(song)
      .then(this._setCurrentSound.bind(this))
      .then(this._playbackEnd.bind(this))
  }
  stop() { //kill current song
    console.log('killing current song', this.currentSound)
    this.currentSound.kill();
  }
  next() {
    this._setNextSongIndex()
    this.currentSound.replace(this.queue[this.currentQueueIndex])
      .then(this._setCurrentSound.bind(this))
      .then(this._playbackEnd.bind(this))
  }
  prev() {
  	this._setPrevSongIndex()
    this.currentSound.replace(this.queue[this.currentQueueIndex])
      .then(this._setCurrentSound.bind(this))
      .then(this._playbackEnd.bind(this))
  }
  setRepeat(repeat) {
  	this.repeat = !!repeat
  }
  setShuffle(shuffle) {
  	this.shuffle = !!shuffle
  }
}
module.exports = MusicPlayer;
