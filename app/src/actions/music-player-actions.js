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