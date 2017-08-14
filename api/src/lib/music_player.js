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
		this.queue = [];
		this.currentQueueIndex = 0;
		this.currentSound = {};
		this.currnetSong = {};
		this.shuffle = false;
		this.repeat = true//false;
		this._readMusicInfo()
		.then((musicInfo) => {
			this.musicInfo = musicInfo
		})
	}
	_parseTimeInfo(time) {
		time = time.split(":");
		time = (time.slice(0,2).concat(time[2].split(".")))
		//console.log(time);
		//console.log(time.map(parseInt));
		//time = time.map(parseInt)
		return time[0] * 1000 * 60 * 60 + time[1] * 1000 * 60 + time[2] * 1000 + time[3]
	}
	_getFileInfo(playlist, name) {
		const self = this;
		return new Promise((resolve, reject) => {
			const filePath = path.join(this.sourceDir, playlist, name)
			const command = `soxi '${filePath}'`
			let fileData = ''
			const soxi = exec(command)
			soxi.stdout.pipe(process.stdout)
			soxi.stdout.on('data', (data) => {
				fileData += data.toString();
			})
			soxi.stdout.on('end', (data) => {
				const duration = self._parseTimeInfo(fileData.match(/\d\d:\d\d:\d\d.\d\d/)[0]);
				resolve({
					name,
					duration,
					path : filePath
				})
			})
		}) 
	}
	_readMusicInfo() {
		const self = this
		const playlists = fs.readdirSync(this.sourceDir);
		console.log('readdirSync', playlists)
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
				console.log('hasMusicInfo')
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
		return this.musicInfo;
	}
	_setQueue(songs) {
		this.currentQueueIndex = 0;
		this.queue = songs;
	}
	_setCurrentSound(currentSound) {
		this.currentSound = currentSound;
		console.log('currentSound', currentSound)
		return currentSound.endPromise
	}
	_setNextSongIndex() {
		if (this.shuffle) { //repeat inculuded
				this.currentQueueIndex = ~~(this.queue.length * Math.random())
		}
		else if (this.repeat && this.currentQueueIndex == this.queue.length - 1) {
			this.currentQueueIndex = 0;
		}
		else {
			this.currentQueueIndex++;	
		}
	}
	_playbackEnd(code) {
		console.log('playback end', code)
		if (code == 'end') {
			this._setNextSongIndex()
			if (this.currentQueueIndex >=0 && this.currentQueueIndex < this.queue.length) {
				this._playQueue()	
			}
		}
	}
	_playQueue() { // recursive playing songs from playQueue
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
	pasue() { //later need to play trimmed sound

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

	}
}
module.exports = MusicPlayer;
