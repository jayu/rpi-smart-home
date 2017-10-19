import axios from 'axios'
import * as actionTypes from './action-types.js'

/* Sync actions */
export const name2 = (index, value) => ({
	type : actionTypes.CHANGE_SOCKET_STATE,
	value,
	index,
})

/* Async actions */

export const playSong = (playlist, songName) => (dispatch, getState) => {
	console.log(playlistName, songName)
	const url = `http://${location.host}/api/musicPlayer/play`
	axios.post(url, {
		playlist,
		songName,
	})
}
export const playPlaylist = (playlist) => (dispatch, getState) => {
	const url = `http://${location.host}/api/musicPlayer/play`
	axios.post(url, {
		playlist,
	})
}