import React from 'react'

import CoffeeMachine from '../CoffeeMachine/CoffeeMachine-container';
import Sockets from '../Sockets/Sockets-container';
import Temperature from '../Temperature/Temperature-container';
import MusicPlayer from '../MusicPlayer/MusicPlayer-container';
const AppView = (props) => {
	return (
    <div className="App">
      <h1>Smart Home</h1>
      <Sockets/>
      <CoffeeMachine/>
      <Temperature/>
      <MusicPlayer/>
    </div>
	)
}

export default AppView
