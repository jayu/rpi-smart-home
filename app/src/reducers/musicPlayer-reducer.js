import * as types from '../actions/action-types'

const initialState = {
	currentSongTitle : "",
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
		{name : "21 savage - ads", duration : 3000},
		{name : "Michael - testoviron", duration : 3000},
		{name : "21 savage - ads", duration : 3000},
	],
	"chill" : [
		{name : "21 savage - ads", duration : 3000},
		{name : "21 savage - ads", duration : 3000},
		{name : "21 savage - ads", duration : 3000},
	]
}
const musicPlayerReducer = (state = initialState, action) => {
	switch (action.type) {
		default : {
			return state
		}
	}
}

export default musicPlayerReducer
