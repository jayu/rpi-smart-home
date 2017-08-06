import axios from 'axios';
import store from './store';
import {changeSocketState} from 'actions/sockets-actions';

export const changeSocketState_tempname_make_thunk = (id, value) => {
	// TODO request
	// TODO middleware
	const url = `http://${location.host}/api/socket/${id}`
	return axios.post(url)
	.then(response => {
		store.dispatch(changeSocketState(id-1, response.data.pin.value));
  }); 
}