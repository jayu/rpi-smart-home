'use-strict';

const fs = require('fs');

const path = require('path');
const { spawn, exec, execFile, fork } = require('child_process');
/* 
	TODO play with trim time

*/
class SoundPlayer {
  constructor() {
    this.queue = []; // {command, resolve}
    this.currentPlaying = false;
    this.volume = 50;
    this.setVolume(this.volume)
  }
  _addToQueue(songs) {
    return new Promise((resolve, reject) => {
      this.queue.push({ songs, resolve });
      this._playNext();
    })
  }
  _insertOnStart(songs) {
    return new Promise((resolve, reject) => {
      this.queue.unshift({ songs, resolve }); //insert on start
      console.log(this.queue)
      this._playNext();
    })
  }
  _playNext() {
    if (!this.currentPlaying && this.queue.length > 0) {
      this.currentPlaying = true;
      let killed = false;
      let resolveEnd = null;
      const self = this;
      const { songs, resolve } = this.queue.shift();
      
      const currentProcess = execFile('play', songs)

      currentProcess.stdout.pipe(process.stdout);
      //currentProcess.stderr.pipe(process.stderr);

      const endPromise = new Promise((resolve, reject) => {
        resolveEnd = resolve
      });

      currentProcess.on('exit', (code, code2) => {
        this.currentPlaying = false;
        self._playNext()
        resolveEnd(!killed ? 'end' : 'killed');
      })

      resolve({
        kill: () => {
          console.log('killing current process', currentProcess)
          killed = true;
          currentProcess.kill()
        },
        replace: (newSound) => {
          killed = true
          currentProcess.kill();
          return self._insertOnStart(newSound.constructor == Array ? newSound : [newSound])
        },
        endPromise,
      })
    } else {
      console.log('playing next: empty queue or player in use')
    }
  }
  setVolume(vol) {
    this.volume = vol;
    return new Promise((resolve, reject) => {
      const setVol = exec(`amixer -c 1 set Speaker ${vol}% -M`)
      setVol.on('exit', () => {
        resolve()
      })
    })
  }
  getVolume() {
    return this.volume
  }
  play(sound) {
    return this._addToQueue(sound.constructor == Array ? sound : [sound])
  }

}
module.exports = {
  SoundPlayer: new SoundPlayer()
}
