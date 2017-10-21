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
          label: "Temperature",
          //backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],
          data: dataArr,
          backgroundColor : "rgba(255, 127, 80, 0.39)",
          borderColor : "rgba(255, 127, 80, 0.8)",
          pointBorderColor: "coral",
          pointBackgroundColor: "#fff",
          pointBorderWidth: 2,
          pointHoverRadius: 5,
        }
      ]
    }
   const options ={
      legend: { display: false },
      title: {
        display: true,
        text: 'Temperature history'
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
