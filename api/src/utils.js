const parseBoolean = (value) => {
	switch (value) {
		case 'true' : return true; break;
		case 'false': return false; break;
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