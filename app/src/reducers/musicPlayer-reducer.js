import * as types from '../actions/action-types'

const initialState = {
	currentSongTitle : "",
	currentPlaylist : "",
	playlists : [],
	shuffle : false,
	random : false,
	volume : 50,// 0-100	
	playbackState : "paused", //"playing, paused"
	playStartTime : null,
	songStartedAt : 0, //
	spotifySyncState : "Done",
}
const musicPlayerReducer = (state = initialState, action) => {
	switch (action.type) {
		case types.SET_PLAYLISTS: {
			return {...state, playlists : action.playlists}
		}
		case types.SET_CURRENT_SONG: {
			return {...state, currentSongTitle : action.songName}
		}
		case types.SET_PLAYBACK_STATE: {
			return {...state, playbackState : action.state}
		}
		case types.SET_VOLUME: {
			return {...state, volume : action.volume}
		}
		case types.SET_SHUFFLE: {
			return {...state, shuffle : action.shuffle}
		}
		case types.SET_REPEAT: {
			return {...state, repeat : action.repeat}
		}
		case types.SET_SYNC_STATE: {
			return {...state, spotifySyncState : action.state}
		}
		default : {
			return state
		}
	}
}

export default musicPlayerReducer
