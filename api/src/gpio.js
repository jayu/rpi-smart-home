const fake_gpio = {
	read :  (a,b) => {b(null, true)},
	write : (a,b,c) => {c(null)},
	setup : (a,b,c) => {c()},
	DIR_IN : true,
	DIR_OUT : true
}
const gpio = require('os').userInfo().username == "root" ? fake_gpio : require('rpi-gpio');

const state = [];
const pins = {
	read : {
		//thermometer : 12
	},
	write : {
		bigCoffee : [5, false],
		smallCoffee : [8, false],
		socket1 : [11, true],
		socket2 : [12, true],
		socket3 : [13, true],
		socket4 : [15, true],
	}
}

const mapWritePins = (pins) => {
	var writePins = {}
	Object.keys(pins).forEach((key) => {
		writePins[key] = pins[key][0]
	})
	return writePins;
}
const mergePins = (pins) => (Object.assign({}, pins.read, mapWritePins(pins.write)))

const setup = (pin, type) => {
	return new Promise((resolve, reject) => {
		gpio.setup(pin, type, (err) => {			
			resolve(true);
		});
	})
}
const read = (pin) => {
	return new Promise((resolve, reject) => {
		gpio.read(pin, (err, value) => {
			if (err) {
				reject(err);
			}
			else {
				resolve(value);
			}
		})
	})
}
const write = (pin, value) => { // default toggle
	if (value == undefined) {
		value = state[pin] = !state[pin]
	}
	else {
		state[pin] = value
	}
	return new Promise((resolve, reject) => {
		gpio.write(pin, value, (err) => {
			if (err) {
				reject(err);
			}
			else {
				resolve(value);
			}
		})
	})
}

const _setup = (pins) => {
	const promises = []
	Object.keys(pins.read).forEach((pinName) => {
		promises.push(setup(pins.read[pinName], gpio.DIR_IN));
	})
	Object.keys(pins.write).forEach((pinName) => {
		const pinNum = pins.write[pinName][0];
		const pinVal = pins.write[pinName][1];
		promises.push(setup(pinNum, gpio.DIR_OUT).then((err, msg) => { 
			console.log(pinNum, pinVal)
			console.log('setup res', err,msg)
			return write(pinNum, pinVal)
		}))
	})
	Promise.all(promises)
	.then(() => {
		console.log('setup');
	})
	.catch((err) => {console.log('setup error', err)})
}
_setup(pins);

module.exports = {
	state,
	_pins : pins,
	pins : mergePins(pins),
	read,
	write
}
