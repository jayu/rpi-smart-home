const fs = require('fs');
const path = require('path')
const {spawn, exec} = require('path')
const {SoundPlayer} = require('./sound_player.js')


/* 
	co z przewijaniem, co z czasem piosenki ? 
	 - czytanie output streamu lub na początek ustawienie timeoutu po odczytaniu danych piosenki ?
	 - (?) odpalanie z określonym czasem
*/


class MusicPlayer {
	constructor(sourceDir) {
		//this.soundPlayer = soundPlayer;
		this.sourceDir = sourceDir;
		this.musicInfo = {};
		this.playQueue = [];
		this.currentPlayingSound = {};
		this.currnetPlayingSong = {};
		this.shuffle = false;
		this.repeat = false;
	}
	_getFileInfo(name) {
		const soxi = exec(`soxi ${path.join(this.sourceDir, name)}`)
		soxi.on('data', (data) => {
			console.log('soxi data : ', data);
		})

	}
	_readMusicInfo() {

	}
	getMusicInfo() {

	}
	play(args) {
		args = {
			playlist : '', // playlist id
			song : '', // song id
			songLike : '', // string 
		}
	}
	next() {

	}
	prev() {

	}
}
module.exports = MusicPlayer;