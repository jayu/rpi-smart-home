const fs = require('fs');
const path = require('path');
const { spawn, exec, execFile, fork } = require('child_process'); 

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
			
			process.stdout.pipe(currentProcess.stdout);

			currentProcess.on('exit', (code) => {
				this.currentPlaying = false;
				self._playNext()
			})

			resolve({
				kill : () => {
					currentProcess.kill()
				},
				replace : (newSound) => {
					currentProcess.kill(); 
					return self._insertOnStart(newSound)
				}
			})
			
		}

	}
	_joinSounds(soundArr) {
		let command = '';
		for (let i = 0; i < soundArr.length-2; i++) {
			command += `play ${soundArr[i]} && `;
		}
		command += `play ${soundArr[i]}`
		return this._addToQueue(command);
	}
	_soundToCommand(sound) {
		const command = '';
		if (typeof sound == Array) {
			command = _joinSounds(sound)
		}
		else {
			command = `play ${sound}`
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