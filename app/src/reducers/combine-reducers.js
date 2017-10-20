import { combineReducers } 	from 'redux'
import socketsReducer from './sockets-reducer'
import temperatureReducer from './temperature-reducer'
import musicPlayerReducer from './musicPlayer-reducer'
const reducers = combineReducers({
	socketsState: socketsReducer,
	temperatureState : temperatureReducer,
	musicPlayerState : musicPlayerReducer,
})
export default reducers
