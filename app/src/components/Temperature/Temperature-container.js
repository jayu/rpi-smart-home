import { connect } from 'react-redux'
import {playTemperature} from '../../actions/temperature-actions'
import TemperatureView from './Temperature-view.jsx'
import store from '../../store'
import './Temperature-style.scss'

const mapStateToProps = state => ({
	temperature : state.temperatureState.temperature,
	temperatureList : state.temperatureState.temperatureList
})

const mapDispatchToProps = (dispatch) => {
	const dispatches = {
		playTemperature : () => { 
			dispatch(playTemperature()) 
		}
	}
	return dispatches
}

export default connect(mapStateToProps, mapDispatchToProps)(TemperatureView)
