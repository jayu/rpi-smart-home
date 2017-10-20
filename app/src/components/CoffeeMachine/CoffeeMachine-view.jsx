import React from 'react'


const CoffeeMachineView = (props) => {
	return (
    <div className="CoffeeMachine">
      <button onClick={props.makeCoffee("small")}>Small <i className="fa fa-coffee" aria-hidden="true"></i></button>
      <button onClick={props.makeCoffee("big")}>Big <i className="fa fa-coffee" aria-hidden="true"></i></button>
    </div>
	)
}

export default CoffeeMachineView
