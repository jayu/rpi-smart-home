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
        <p className="songName">{props.currentSongTitle}</p>
        <div className="buttons">
          <button style={props.shuffle ? {backgroundColor : 'red'} : null} onClick={props.toggleShuffle(props.shuffle)}>&#10536;</button>
          <button onClick={props.prev}>&lt;</button>
          <button onClick={playPauseBtnAction} disabled={playPauseBtnAction==null}>{playPauseBtn}</button>
          <button onClick={props.next}>&gt;</button>
          <button style={props.repeat ? {backgroundColor : 'red'} : null} onClick={props.toggleRepeat(props.repeat)}>&#8635;</button>
        </div>
      </div>
    </div>
	)
}

export default MusicPlayerView
