import axios from 'axios'
//import * as actionTypes from './action-types.js'


export const makeCoffee = (type="small") => (dispatch, getState) => {	
	const url = `http://${location.host}/api/${type}Coffee` // TODO export hostname etc.
	
	axios.post(url)
	.then(response => {

  }); 
}