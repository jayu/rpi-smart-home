import { connect } from 'react-redux'
import {playSong, playPlaylist} from '../../actions/music-player-actions'
import PlaylistsListView from './MusicPlayer-playlistsList-view.jsx'
import store from '../../store'
import './MusicPlayer-playlistsList-style.scss'

const mapStateToProps = state => (state.musicPlayerState)

const mapDispatchToProps = (dispatch) => {
	const dispatches = {
		playPlaylist : (playlistName) => (event) => {
			if (event.target.tagName.toLowerCase() != 'li') {
				dispatch(playPlaylist(playlistName))
			}
		},
		playSong : (playlistName, songName) => (event) => {
				dispatch(playSong(playlistName, songName))
		}
	}
	return dispatches
}

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistsListView)
