import axios from 'axios'
import * as actionTypes from './action-types.js'

/* Sync actions */
export const setPlaylistsInfo = (playlists) => ({
	type : actionTypes.SET_PLAYLISTS,
	playlists
})

/* Async actions */
export const getMusicInfo = () => async (dispatch, getState) => {
	const musicInfo = await axios.get(`http://${location.host}/api/musicPlayer/musicInfo`)
	dispatch(setPlaylistsInfo(musicInfo.data.playlists))

}
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