import {getInitialState} from './setup-actions';

export const socketReceive = (msg) => (dispatch, getState) => {
	console.log(msg);
	switch(msg.type) {
		case 'STATE_CHANGED' : dispatch(getInitialState())
	}

}