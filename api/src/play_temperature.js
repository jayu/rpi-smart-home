const { exec } = require('child_process');
const fs = require('fs');
const path = require('path')
const sensor = require('ds18x20')
function getTemp() {
	return new Promise((resolve,reject) => {
		sensor.get('28-0000092a6299', function(err, temp) {
			resolve(temp)	
		})
	})
}
function monitorTemp() {
	let temperature = {}
	const filepath = path.join(__dirname, '../out/temp.json')
	if (fs.existsSync(filepath)) {
		temperature = JSON.parse(fs.readFileSync(filepath));
	}
	console.log(temperature);
	getTemp().then((temp) => {
		console.log(temp)
		temperature[Date.now()] = temp;
		const tempString = JSON.stringify(temperature);
		console.log(filepath);
		const writeRes = fs.writeFileSync(filepath, tempString)
		console.log(tempString, writeRes)
	})
	.catch((e) => {console.log(e)})
}
function play(degree) {
	degree = ~~degree
	console.log(degree);
	const path = './src/res/'
	let command = `play ${path}hello.mp3 && play ${path}haha.mp3 && play ${path}is.mp3 && `
	if (degree < 18) {
		command += `play ${path}less.mp3 && `
	}
	else if (degree <= 20) {
		command += `play ${path}${degree}.mp3 && `
	}
	else if (degree <=29) {
		command += `play ${path}${(~~(degree / 10)) * 10}.mp3 && `
		command += `play ${path}${(degree % 10)}.mp3 && `
	}
	else {
		command += `play ${path}more.mp3 && `
		command += `play ${path}${20}.mp3 && `
		command += `play ${path}${9}.mp3 && `	
	}
	command += `play ${path}degree.mp3`
	//console.log(command);
	exec(command, (err, stdout, stderr) => {
	  if (err) {
	    console.log('err', err);
	    return;
	  }

	  // the *entire* stdout and stderr (buffered)
	  console.log(`stdout: ${stdout}`);
	  console.log(`stderr: ${stderr}`);
	});
}

module.exports = {
	play,
	getTemp,
	monitorTemp,
}
