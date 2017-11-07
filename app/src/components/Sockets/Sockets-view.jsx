import React from 'react'

import CheckBox from '../CheckBox/CheckBox-view'
import axios from 'axios'
const SocketsView = (props) => {
	return (
    <div className="Sockets">
    	{props.sockets.map((value, index) => (
    		<CheckBox checked={value} key={index} onChange={props.changeSocketState(index)}>
    			{`Socket ${index+1}`}
    		</CheckBox>)
    	)}
    	{/*  very temporary */}
    	<button onClick={(() => {axios.post(`http://${location.host}/api/opendoor`)})}>Open door</button>
    </div>
	)
}

export default SocketsView
