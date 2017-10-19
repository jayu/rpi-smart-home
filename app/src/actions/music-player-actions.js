import axios from 'axios'
import * as actionTypes from './action-types.js'

/* Sync actions */
export const name2 = (index, value) => ({
	type : actionTypes.CHANGE_SOCKET_STATE,
	value,
	index,
})

/* Async actions */

export const name = (index) => (dispatch, getState) => {
	
}