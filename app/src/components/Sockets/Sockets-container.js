import { connect } from 'react-redux'

import SocketsView from './Sockets-view.jsx'
import store from '../../store'
import './Sockets-style.scss'
import {postSocketState} from '../../actions/sockets-actions'

const mapStateToProps = state => ({
	sockets : state.socketsState.sockets
})

const mapDispatchToProps = (dispatch) => {
	const dispatches = {
		changeSocketState : (index) => () => {
			dispatch(postSocketState(index))
		}
	}
	return dispatches
}

export default connect(mapStateToProps, mapDispatchToProps)(SocketsView)
