const parseBoolean = (value) => {
	switch (value) {
		case 'true' : 
		case '1' :
		case 1 :
		case true :
			return true; break;
		case 'false': 
		case '0': 
		case 0: 
		case false: 
			return false; break;
		default : return undefined; break; 
	}
}
const ip = () => {
	const os = require('os');
	const interfaces = os.networkInterfaces();
	const addresses = [];
	for (let k in interfaces) {
	    for (let k2 in interfaces[k]) {
	        const address = interfaces[k][k2];
	        if (address.family === 'IPv4' && !address.internal) {
	            addresses.push(address.address);
	        }
	    }
	}

	return addresses;
}


module.exports = {
	parseBoolean,
	ip,
}