import * as types from '../actions/action-types'

const initialState = {
	currentSongTitle : "Test songs",
	currentPlaylist : "",
	playlists : [],
	shuffle : false,
	random : false,
	volume : .5,// 0-1	
	playbackState : "", //"playing, paused, stopped"
	playStartTime : null,
	songStartedAt : 0, //
}
initialState.playlists = {
	"trap" : [
		{name : "21 savavge - ads", duration : 3000},
		{name : "Michael - testoviron", duration : 3000},
		{name : "21 savage - axcvds", duration : 3000},
	],
	"chill" : [
		{name : "21 savage - vads", duration : 3000},
		{name : "21 savagve - ads", duration : 3000},
		{name : "21 savavge - ads", duration : 3000},
	]
}
const musicPlayerReducer = (state = initialState, action) => {
	console.log('musicPlayerReducer')
	switch (action.type) {
		case types.SET_PLAYLISTS: {
			console.log('setting playlists')
			return {...state, playlists : action.playlists}
		}
		default : {
			return state
		}
	}
}

export default musicPlayerReducer
