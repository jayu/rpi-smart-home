import { createStore, applyMiddleware } from 'redux'
import thunk 														from 'redux-thunk'
import webSocketInit									  from './websocket'
import reducers 												from './reducers/combine-reducers'
import {getInitialState} 								from './actions/setup-actions'
import {getTemperatureList} 						from './actions/temperature-actions'
import {getMusicInfo} 									from './actions/music-player-actions'


const store = createStore(reducers, applyMiddleware(thunk))

webSocketInit(store);
store.dispatch(getInitialState());
store.dispatch(getTemperatureList())
store.dispatch(getMusicInfo())


export default store
