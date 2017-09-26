const lcd = require('./lcd')
const { ip } = require('./utils')
const { getTemp } = require('../play_temperature.js')
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
			return lcd.writeString(['Welcome', ip()[0], 'Have a nice day :)', '      Yours Karaluch'])
		})
		.then(() => {
			setTimeout(self.idle.bind(self), 10000)
		})
	}
	idle() {
		console.log('printing')
		const self = this
		return getTemp()
		.then((temperature) => {
			temperature = temperature || 20.0
			console.log(temperature)
			return lcd.clear()
			.then(() => {
				const date = new Date()
				const dateArr = date.toLocaleDateString().split('-')
				dateArr.reverse()
				const dateString = dateArr.join('-')
				const ipArr = ip()[0].split('.')
				
				return lcd.writeString([
					dateString +  '  ' + date.toLocaleTimeString() + '  ', 
					`in: ${temperature} C out: ${temperature} C`,
					'',
					ipArr[2] + '.' + ipArr[3], 
				])
			})
			.then(() => {
				console.log('printed')
				setTimeout(() => {
					self.idle()
				}, 60 * 1000)
			})
			.catch((err) => {
				console.log('display err', err)
			})
		})
	}
}

module.exports = (new Display())
