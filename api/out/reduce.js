const fs = require('fs')

const temp = require('./temp.json')
const newTemp = {}
Object.keys(temp).forEach((key) => {
	console.log(Date.now() - key)
	if (temp[key] < 40 && temp[key] > -30) {
	//if (key != "1508451231022") {
		newTemp[key] = temp[key]
	}
})

fs.writeFileSync('./temp.json', JSON.stringify(newTemp))
