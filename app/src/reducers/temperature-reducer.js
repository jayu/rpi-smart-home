import * as types from '../actions/action-types'

const initialState = {
	temperature : "",
	temperatureList : {},
}
const temperatureReducer = (state = initialState, action) => {
	switch (action.type) {
		case types.CHANGE_TEMPERATURE : {
			state.temperature = action.temperature
			return {...state}
		}
		case types.SET_TEMPERATURE_LIST : {
			state.temperatureList = action.temperatureList
			return {...state}
		}
		default : {
			return state
		}
	}
}

export default temperatureReducer
