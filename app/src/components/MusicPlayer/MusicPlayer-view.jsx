import React from 'react'
import PlaylistsList from '../MusicPlayer-playlistsList/MusicPlayer-playlistsList-container.js'

const MusicPlayerView = (props) => {
  const playPauseBtn = props.playbackState == 'playing' ? "pause" :  "play"
  const playPauseBtnAction = props.playbackState == 'playing' ? props.pause : props.playbackState == "paused" ? props.resume : null
  console.log(props.playbackState, playPauseBtnAction)
	return (
    <div className="MusicPlayer">        
      <PlaylistsList/>
      <div className="bottomPanel">
        <p>{props.currentSongTitle}</p>
        <div className="buttons">
          <button style={props.shuffle ? {backgroundColor : 'red'} : null}>&#10536;</button>
          <button>&lt;</button>
          <button onClick={playPauseBtnAction} disabled={playPauseBtnAction==null}>{playPauseBtn}</button>
          <button>&gt;</button>
          <button style={props.repeat ? {backgroundColor : 'red'} : null}>&#8635;</button>
        </div>
      </div>
    </div>
	)
}

export default MusicPlayerView
