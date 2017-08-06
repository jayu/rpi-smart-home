import axios from 'axios'
import * as actionTypes from './action-types.js'

export const changeSocketState = (index, value) => ({
	type : actionTypes.CHANGE_SOCKET_STATE,
	value,
	index,
})

export const postSocketState = (index) => (dispatch, getState) => {
	const currentValue = getState().socketsState.sockets[index];

	dispatch(changeSocketState(index, !currentValue));
	
	const url = `http://${location.host}/api/socket/${index+1}` // TODO export hostname etc.
	
	axios.post(url)
	.then(response => {
		dispatch(changeSocketState(index, !response.data.pin.value));
  }); 
}