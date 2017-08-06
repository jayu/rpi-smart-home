import React from 'react'
import {Line} from 'react-chartjs-2';


const TemperatureView = (props) => {
	console.log(props.temperatureList)
	const dataArr = (() => {
				const keys = Object.keys(props.temperatureList)
				return keys.map((key) => (props.temperatureList[key]))
			})()

	const data = {
      labels: Object.keys(props.temperatureList).map((label) => ((new Date(parseInt(label))).toLocaleTimeString())),
      datasets: [
        {
          label: "Population (millions)",
          //backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],
          data: dataArr
        }
      ]
    }
   const options ={
      legend: { display: false },
      title: {
        display: true,
        text: 'Predicted world population (millions) in 2050'
      }
    }
	return (
    <div className="Temperature">
      <button onClick={props.playTemperature}>Play Temperature</button>
      <p>{props.temperature}</p>
			<Line data={data} options={options} width={800} height={300} />
    </div>
	)
}

export default TemperatureView
