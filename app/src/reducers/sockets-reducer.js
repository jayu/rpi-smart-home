import * as types from '../actions/action-types'

const initialState = {
	sockets : [false, false, false, false]
}

const socketsReducer = (state = initialState, action) => {
	switch (action.type) {
		case types.CHANGE_SOCKET_STATE : {
			const newSockets = [...state.sockets];
			newSockets[action.index] = action.value;
			return {...state, sockets : newSockets};
		}
		default : {
			return state
		}
	}
}

export default socketsReducer
