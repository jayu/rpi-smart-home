const parseBoolean = (value) => {
	switch (value) {
		case 'true' : return true; break;
		case 'false': return false; break;
		default : return undefined; break; 
	}
}



module.exports = {
	parseBoolean,
}
