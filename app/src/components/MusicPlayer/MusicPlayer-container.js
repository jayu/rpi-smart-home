import { connect } from 'react-redux'
import {pausePlayback, resumePlayback} from '../../actions/music-player-actions'

import MusicPlayerView from './MusicPlayer-view.jsx'
import store from '../../store'
import './MusicPlayer-style.scss'

const mapStateToProps = state => (state.musicPlayerState)

const mapDispatchToProps = (dispatch) => {
	const dispatches = {
		pause : () => {
			dispatch(pausePlayback())
		},
		resume : () => {
			dispatch(resumePlayback())
		}
	}
	return dispatches
}

export default connect(mapStateToProps, mapDispatchToProps)(MusicPlayerView)
