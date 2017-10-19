import * as types from '../actions/action-types'

const initialState = {
	currentSongTitle : "Test songs",
	currentPlaylist : "",
	playlists : [],
	shuffle : false,
	random : false,
	volume : .5,// 0-1	
	playbackState : "paused", //"playing, paused"
	playStartTime : null,
	songStartedAt : 0, //
}
const musicPlayerReducer = (state = initialState, action) => {
	console.log('musicPlayerReducer')
	switch (action.type) {
		case types.SET_PLAYLISTS: {
			return {...state, playlists : action.playlists}
		}
		case types.SET_CURRENT_SONG: {
			console.log('setting currentSong')
			return {...state, currentSongTitle : action.songName, playbackState : 'playing'}
		}
		case types.SET_PLAYBACK_STATE: {
			console.log('setting SET_PLAYBACK_PAUSE')
			return {...state, playbackState : action.state}
		}
		default : {
			return state
		}
	}
}

export default musicPlayerReducer
