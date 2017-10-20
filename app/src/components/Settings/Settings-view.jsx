import React from 'react'
import PlaylistsList from '../MusicPlayer-playlistsList/MusicPlayer-playlistsList-container.js'

const MusicPlayerView = (props) => {
	return (
    <div className="Settings">        
      <p>Speaker Volume</p>
      <input type="range" min="0" max="100" value={props.volume} onChange={props.setVolume}/>
      <p>Spotify sync {props.spotifySyncState}</p>
      <button onClick={props.spotifySync}><i className="fa fa-refresh" aria-hidden="true"></i></button>
    </div>
	)
}

export default MusicPlayerView
