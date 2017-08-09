import { connect } from 'react-redux'

import {makeCoffee} from '../../actions/coffeeMachine-actions'

import CoffeeMachineView from './CoffeeMachine-view.jsx'
import store from '../../store'
import './CoffeeMachine-style.scss'

const mapStateToProps = state => ({

})

const mapDispatchToProps = (dispatch) => {
	const dispatches = {
		makeCoffee : (type="small") => () => {
			dispatch(makeCoffee(type));
		}
	}
	return dispatches
}

export default connect(mapStateToProps, mapDispatchToProps)(CoffeeMachineView)
