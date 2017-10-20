import {getInitialState} from './setup-actions';
import {setCurrentSong, setSyncState} from './music-player-actions';

export const socketReceive = (msg) => (dispatch, getState) => {
	console.log('ws msg', msg);
	switch(msg.type) {
		case 'STATE_CHANGED' : dispatch(getInitialState())
		case 'SONG_NAME_CHANGED' : dispatch(setCurrentSong(msg.name))
		case 'SPOTIFY_SYNC_STATE' : dispatch(setSyncState(msg.state))
	}

}