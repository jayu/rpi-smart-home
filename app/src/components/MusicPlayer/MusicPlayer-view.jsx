import React from 'react'
import PlaylistsList from '../MusicPlayer-playlistsList/MusicPlayer-playlistsList-container.js'

const MusicPlayerView = (props) => {
  const playPauseBtn = props.playbackState == 'playing' ? (<i className="fa fa-pause" aria-hidden="true"></i>) :  (<i className="fa fa-play" aria-hidden="true"></i>)
  const playPauseBtnAction = props.playbackState == 'playing' ? props.pause : props.playbackState == "paused" ? props.resume : null
  console.log(props.playbackState, playPauseBtnAction)
	return (
    <div className="MusicPlayer">        
      <PlaylistsList/>
      <div className="bottomPanel">
        <p className="songName">{props.currentSongTitle}</p>
        <div className="buttons">
          <button className={props.shuffle ? "selected" : ""} onClick={props.toggleShuffle(props.shuffle)}>
            <i className="fa fa-random" aria-hidden="true"></i>
          </button>
          <button onClick={props.prev}>
            <i className="fa fa-chevron-left" aria-hidden="true"></i>
          </button>
          <button onClick={playPauseBtnAction} disabled={playPauseBtnAction==null}>{playPauseBtn}</button>
          <button onClick={props.next}>
            <i className="fa fa-chevron-right" aria-hidden="true"></i>
          </button>
          <button className={props.repeat ? "selected" : ""} onClick={props.toggleRepeat(props.repeat)}>
            <i className="fa fa-repeat" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </div>
	)
}

export default MusicPlayerView
