import { combineReducers } 	from 'redux'
import socketsReducer from './sockets-reducer'
import temperatureReducer from './temperature-reducer'
const reducers = combineReducers({
	socketsState: socketsReducer,
	temperatureState : temperatureReducer
})
export default reducers
