import * as actionTypes from './action-types.js'
import axios from 'axios'
export const setTemperature = (temperature) => ({
	type : actionTypes.CHANGE_TEMPERATURE, 
	temperature
})
export const setTemperatureList = (temperatureList) => ({
	type : actionTypes.SET_TEMPERATURE_LIST,
	temperatureList
})
export const playTemperature = () => (dispatch, getState) => {
	
	const url = `http://${location.host}/api/temperature` // TODO export hostname etc.
	console.log(url);
	axios.post(url)
	.then(response => {
		dispatch(setTemperature(response.data.temperature));
  }); 
}
export const getTemperatureList = () => (dispatch, getState) => {
	const url = `http://${location.host}/api/temperatureList` // TODO export hostname etc.
	console.log(url);
	axios.get(url)
	.then(response => {
		console.log(setTemperatureList(response.data.temperatureList))
		dispatch(setTemperatureList(response.data.temperatureList));
  });	
}