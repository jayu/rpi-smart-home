import axios from 'axios'
import * as actionTypes from './action-types.js'

/* Sync actions */
export const setPlaylistsInfo = (playlists) => ({
	type : actionTypes.SET_PLAYLISTS,
	playlists
})
export const setCurrentSong = (songName) => ({
	type : actionTypes.SET_CURRENT_SONG,
	songName
})

export const setPlaybackState = (state) => ({
	type : actionTypes.SET_PLAYBACK_STATE,
	state
})
export const setShuffle = (shuffle) => ({
	type : actionTypes.SET_SHUFFLE,
	shuffle
})
export const setRepeat = (repeat) => ({
	type : actionTypes.SET_REPEAT,
	repeat
})
export const setVolume = (volume) => ({
	type : actionTypes.SET_VOLUME,
	volume
})

/* Async actions */
export const getMusicInfo = () => async (dispatch, getState) => {
	const musicInfo = await axios.get(`http://${location.host}/api/musicPlayer/musicInfo`)
	dispatch(setPlaylistsInfo(musicInfo.data.playlists))

}
export const getPlayerSetup = () => async (dispatch, getState) => {
	const palyerState = await axios.get(`http://${location.host}/api/musicPlayer/setup`)
	console.log('has music player state', palyerState)
	dispatch(setVolume(palyerState.data.volume))
	dispatch(setShuffle(palyerState.data.shuffle))
	dispatch(setRepeat(palyerState.data.repeat))
	dispatch(setPlaybackState(palyerState.data.playbackState))
	dispatch(setCurrentSong(palyerState.data.songName))
}
export const playSong = (playlist, songName) => async (dispatch, getState) => {
	console.log(playlist, songName)
	const url = `http://${location.host}/api/musicPlayer/play`
	await axios.post(url, {
		playlist,
		songName,
	})
	dispatch(setCurrentSong(songName))
	dispatch(setPlaybackState("playing"))
}
export const playPlaylist = (playlist) => async (dispatch, getState) => {
	const url = `http://${location.host}/api/musicPlayer/play`
	await axios.post(url, {
		playlist,
	})
	dispatch(setCurrentSong(songName))
	dispatch(setPlaybackState("playing"))

}
export const pausePlayback = () => async (dispatch, getState) => {
	const url = `http://${location.host}/api/musicPlayer/pause`
	await axios.post(url)
	dispatch(setPlaybackState('paused'))
}
export const resumePlayback = () => async (dispatch, getState) => {
	const url = `http://${location.host}/api/musicPlayer/resume`
	await axios.post(url)
	dispatch(setPlaybackState('playing'))	
}

export const nextSong = () => async (dispatch, getState) => {
	const url = `http://${location.host}/api/musicPlayer/next`
	await axios.post(url)
}

export const prevSong = () => async (dispatch, getState) => {
	const url = `http://${location.host}/api/musicPlayer/prev`
	await axios.post(url)
}

export const toggleShuffle = (shuffle) => async (dispatch, getState) => {
	const url = `http://${location.host}/api/musicPlayer/setShuffle`
	await axios.post(url, {
		shuffle
	})
	dispatch(setShuffle(shuffle))
}
export const toggleRepeat = (repeat) => async (dispatch, getState) => {
	console.log(repeat)
	const url = `http://${location.host}/api/musicPlayer/setRepeat`
	await axios.post(url, {
		repeat
	})
	dispatch(setRepeat(repeat))
}

export const spotifySync = () => async (dispatch, getState) => {
	console.log('Sync spotify')
	const url = `http://${location.host}/api/musicPlayer/spotifySync`
	await axios.post(url)
	alert('sync in progress')
}
export const changeVolume = (volume) => async (dispatch, getState) => {
	const url = `http://${location.host}/api/musicPlayer/setVolume`
	await axios.post(url, {
		volume
	})
	dispatch(setVolume(volume))
}