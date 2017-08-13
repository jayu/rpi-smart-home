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
	_getFileInfo(name) {
		return new Promise((resolve, reject) => {
			const filePath = `soxi '${path.join(this.sourceDir, name)}'`
			const fileData = ''
			const soxi = exec(filePath)
			soxi.stdout.pipe(process.stdout)
			soxi.stdout.on('data', (data) => {
				fileData += data.toString();
			})
			soxi.stdout.on('end', (data) => {
				resolve(fileData)
			})
		}) 
	}
	_readMusicInfo() {
		const self = this
		const playlists = fs.readdirSync(this.sourceDir);
		return Promise.all(
			playlists.map((playlist) => {
				const songs = fs.readdirSync(path.join(path.sourceDir, playlist))
				return new Promise.all(songs.map((song) => {
					return self._getFileInfo(path.join(playlist, song))
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
