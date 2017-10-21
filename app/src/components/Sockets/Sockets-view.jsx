import React from 'react'

import CheckBox from '../CheckBox/CheckBox-view'

const SocketsView = (props) => {
	return (
    <div className="Sockets">
    	{props.sockets.map((value, index) => (
    		<CheckBox checked={value} key={index} onChange={props.changeSocketState(index)}>
    			{`Socket ${index+1}`}
    		</CheckBox>)
    	)}
    </div>
	)
}

export default SocketsView
