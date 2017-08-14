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
	}
	_addToQueue(songs) { 
		return new Promise((resolve, reject) => {
			this.queue.push({songs, resolve});
			this._playNext();
		})
	}
	_insertOnStart(songs) {
		return new Promise((resolve, reject) => {
			this.queue.unshift({songs, resolve}); //insert on start
			console.log(this.queue)
			this._playNext();
		})
	}
	_playNext() {
		if (!this.currentPlaying && this.queue.length > 0) {
			this.currentPlaying = true;
			let killed = false;
			const self = this;
			const {songs, resolve} = this.queue.shift();
			//const currentProcess = execFile(command);
			const currentProcess = execFile('play', songs)
			//currentProcess.stdout.pipe(process.stdout);
			//currentProcess.stderr.pipe(process.stderr);
			let resolveEnd = null;
			const endPromise = new Promise((resolve, reject )=> {
				resolveEnd = resolve
			});
			let logs = '';
			currentProcess.on('data', (data) => {
				logs += data.toString()
				console.log(logs)
			})
			currentProcess.on('exit', (code, code2) => {
	 
      	console.log('out', logs)
	console.log('exit code', code, code2);
      	this.currentPlaying = false;
      	self._playNext()
				resolveEnd(!killed ? 'end' : 'killed');
    	})

			resolve({
      	kill : () => {
	  console.log('killing current process', currentProcess)
	  killed = true;
          currentProcess.kill()
      	},
      	replace : (newSound) => {
		killed = true
        	currentProcess.kill();
        	return self._insertOnStart(newSound.constructor == Array ? newSound : [newSound])
      	},
      	endPromise,
    	})		
		}
		else {
			console.log('playing next: empty queue or player in use')
		}

	}
	_joinSounds(soundArr) {
		let command = '';
		for (let i = 0; i < soundArr.length-1; i++) {
			command += `play '${soundArr[i]}' && `;
		}
		command += `play '${soundArr[soundArr.length-1]}'`
		
		return command;
	}
	_soundToCommand(sound) {
		let command = '';
		if (sound.constructor == Array) {
			console.log('joining sounds');
			command = this. _joinSounds(sound)
		}
		else {
			command = `play '${sound}'`
		}
		return command;
	}
	play(sound) {
		return this._addToQueue(sound.constructor == Array ? sound : [sound])
	}

}
module.exports = {
	SoundPlayer : new SoundPlayer()
}
