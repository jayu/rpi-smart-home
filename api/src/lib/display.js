const lcd = require('./lcd')
const { ip } = require('./utils')
const { getTemperature } = require('../play_temperature.js')
class Display {
	constructor() {

	}
	init() {
		return lcd.init()
	}
	welcome() {
		const self = this;
		lcd.clear()
		.then(() => {
			return lcd.writeString(['Welcome', ip(), 'Have a nice day :)', '      Yours Karaluch'])
		})
		.then(() => {
			setTimeout(self.idle, 5000)
		})
	}
	idle() {
		const self = this
		return getTemperature()
		.then((temperature) => {
			temperature = temperature || 20.0
			return lcd.clear()
			.then(() => {
				const date = new Date()
				return lcd.writeString([
					date.toLocaleDateString() + '  ' + date.toLocaleTimeString(), 
					`in: ${temperature} °C, out : ${temperature} °C`,
					ip().substr(6), 
				])
			})
			.then(self.idle)
		})
	}
}

module.exports = (new Display())