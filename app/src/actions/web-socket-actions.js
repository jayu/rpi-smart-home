import {getInitialState} from './setup-actions';
import {setCurrentSong} from './music-player-actions';

export const socketReceive = (msg) => (dispatch, getState) => {
	console.log('ws msg', msg);
	switch(msg.type) {
		case 'STATE_CHANGED' : dispatch(getInitialState())
		case 'SONG_NAME_CHANGED' : dispatch(setCurrentSong(msg.name))
	}

}