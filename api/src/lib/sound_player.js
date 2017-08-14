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
	_addToQueue(command) { 
		return new Promise((resolve, reject) => {
			this.queue.push({command, resolve});
			this._playNext();
		})
	}
	_insertOnStart(command) {
		return new Promise((resolve, reject) => {
			//this.queue.push({command, resolve}); insert on start
			this._playNext();
		})
	}
	_playNext() {
		if (!this.currentPlaying && this.queue.length > 0) {
			this.currentPlaying = true;

			const self = this;
			const {command, resolve} = this.queue.shift();
			const currentProcess = exec(command);
			
			currentProcess.stdout.pipe(process.stdout);
			currentProcess.stderr.pipe(process.stderr);
			let resolveEnd = null;
			const endPromise = new Promise((resolve, reject )=> {
				resolveEnd = resolve
			});
			currentProcess.on('exit', (code, code2) => {
      	console.log('exit code', code, code2);
      	this.currentPlaying = false;
      	self._playNext()
				resolveEnd(code != null ? 'end' : 'killed');
    	})

			resolve({
      	kill : () => {
          currentProcess.kill()
      	},
      	replace : (newSound) => {
        	currentProcess.kill();
        	return self._insertOnStart(newSound)
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
		return this._addToQueue(this._soundToCommand(sound))
	}

}
module.exports = {
	SoundPlayer : new SoundPlayer()
}
