const { exec } = require('child_process');
const fs = require('fs');
const path = require('path')
const sensor = require('ds18x20')

const {SoundPlayer} = require('./lib/sound_player.js')

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
	//console.log(temperature);
	getTemp().then((temp) => {
		console.log(temp)
		temperature[Date.now()] = temp;
		const tempString = JSON.stringify(temperature);
		//console.log(filepath);
		const writeRes = fs.writeFileSync(filepath, tempString)
		//console.log(tempString, writeRes)
	})
	.catch((e) => {console.log(e)})
}
function play(degree) {
	degree = ~~degree
	console.log(degree);
	const basicPath = path.join(__dirname, './src/res/')
	const sounds = [];

	sounds.push(`${basicPath}hello.mp3`)  
	sounds.push(`${basicPath}haha.mp3`)
	sounds.push(`${basicPath}is.mp3 `)

	if (degree < 18) {
		sounds.push(`${basicPath}less.mp3`)
	}
	else if (degree <= 20) {
		sounds.push(`${basicPath}${degree}.mp3`)
	}
	else if (degree <=29) {
		sounds.push(`${basicPath}${(~~(degree / 10)) * 10}.mp3`)
		sounds.push(`${basicPath}${(degree % 10)}.mp3`)
	}
	else {
		sounds.push(`${basicPath}more.mp3`)
		sounds.push(`${basicPath}${20}.mp3`)
		sounds.push(`${basicPath}${9}.mp3`)	
	}
	sounds.push(`${basicPath}degree.mp3`)
	console.log(sounds);
	SoundPlayer.play(sounds)
	// exec(command, (err, stdout, stderr) => {
	//   if (err) {
	//     console.log('err', err);
	//     return;
	//   }
	//   // the *entire* stdout and stderr (buffered)
	//   console.log(`stdout: ${stdout}`);
	//   console.log(`stderr: ${stderr}`);
	// });
}

module.exports = {
	play,
	getTemp,
	monitorTemp,
}
