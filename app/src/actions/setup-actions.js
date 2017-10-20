import axios from 'axios'
import {changeSocketState} from './sockets-actions'
export const getInitialState = () => (dispatch, getState) => {
	
	const url = `http://${location.host}/api/setup` // TODO export hostname etc.
	
	axios.get(url)
	.then(response => {
		const pins = response.data.pins;
		Object.keys(pins).forEach((key) => {
			if (key.indexOf('socket') >=0 ) {
				dispatch(changeSocketState(key.substr(6) - 1, !pins[key]))
			}
		})
  }); 
}