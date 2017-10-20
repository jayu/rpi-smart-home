import { connect } from 'react-redux'

import SettingsView from './Settings-view.jsx'
import store from '../../store'
import './Settings-style.scss'

import {changeVolume, spotifySync} from '../../actions/music-player-actions'

const mapStateToProps = state => ({
	volume : state.musicPlayerState.volume,
	spotifySyncState : state.musicPlayerState.spotifySyncState
})

const mapDispatchToProps = (dispatch) => {
	const dispatches = {
		setVolume : (event) => { //TODO throthlle
			console.log(event.target.value)
			dispatch(changeVolume(event.target.value))
		},
		spotifySync : () => {
			dispatch(spotifySync())
		}
	}
	return dispatches
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsView)
