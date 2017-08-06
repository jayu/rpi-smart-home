import { connect } from 'react-redux'

import CoffeeMachineView from './CoffeeMachine-view.jsx'
import store from '../../store'
import './CoffeeMachine-style.scss'

const mapStateToProps = state => ({

})

const mapDispatchToProps = (dispatch) => {
	const dispatches = {}
	return dispatches
}

export default connect(mapStateToProps, mapDispatchToProps)(CoffeeMachineView)
