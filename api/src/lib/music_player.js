const fs = require('fs');
const path = require('path')
const {spawn, exec} = require('child_process')
const {SoundPlayer} = require('./sound_player.js')


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
		this.playQueue = [];
		this.currentPlayingSound = {};
		this.currnetPlayingSong = {};
		this.shuffle = false;
		this.repeat = false;
	}
	_parseTimeInfo(time) {
		time = time.split(":");
		time = (time.slice(0,2).concat(time[2].split(".")))
		console.log(time);
		console.log(time.map(parseInt));
		//time = time.map(parseInt)
		return time[0] * 1000 * 60 * 60 + time[1] * 1000 * 60 + time[2] * 1000 + time[3]
	}
	_getFileInfo(playlist, name) {
		const self = this;
		return new Promise((resolve, reject) => {
			const filePath = `soxi '${path.join(this.sourceDir, playlist, name)}'`
			let fileData = ''
			const soxi = exec(filePath)
			soxi.stdout.pipe(process.stdout)
			soxi.stdout.on('data', (data) => {
				fileData += data.toString();
			})
			soxi.stdout.on('end', (data) => {
				const duration = self._parseTimeInfo(fileData.match(/\d\d:\d\d:\d\d.\d\d/)[0]);
				resolve({
					name,
					duration
				})
			})
		}) 
	}
	_readMusicInfo() {
		const self = this
		const playlists = fs.readdirSync(this.sourceDir);
		return Promise.all(
			playlists.map((playlist) => {
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
					playlists : {}
				}
				for (let i = 0; i < music.length; i++) {
					musicInfo.playlists[playlists[i]] = music[i]
				}
				return musicInfo
			})
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
