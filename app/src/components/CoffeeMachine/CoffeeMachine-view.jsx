import React from 'react'


const CoffeeMachineView = (props) => {
	return (
    <div className="CoffeeMachine">
      <button onClick={props.makeCoffee("small")}>Small Coffee</button>
      <button onClick={props.makeCoffee("big")}>Big Coffee</button>
    </div>
	)
}

export default CoffeeMachineView
