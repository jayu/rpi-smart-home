import React from 'react'
import {Line} from 'react-chartjs-2';


const MusicPlayerView = (props) => {
	return (
    <div className="MusicPlayer">
      <button>shuffle</button>
      <button>prev</button>
      <button>play|pause</button>
      <button>next</button>
      <button>repeat</button>
    </div>
	)
}

export default MusicPlayerView
