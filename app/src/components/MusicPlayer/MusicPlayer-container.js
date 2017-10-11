import { connect } from 'react-redux'
//import {playTemperature} from '../../actions/musicPlayer-actions'
import MusicPlayerView from './MusicPlayer-view.jsx'
import store from '../../store'
import './MusicPlayer-style.scss'

const mapStateToProps = state => ({
})

const mapDispatchToProps = (dispatch) => {
	const dispatches = {
		
	}
	return dispatches
}

export default connect(mapStateToProps, mapDispatchToProps)(MusicPlayerView)
