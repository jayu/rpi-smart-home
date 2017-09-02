const fs = require('fs')
const path = require('path')
const deleteFolderRecursive = function(_path) {
  if( fs.existsSync(_path) ) {
    fs.readdirSync(_path).forEach(function(file,index){
      var curPath = _path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(_path);
  }
};

const titleCoverage = (desiredTitle, foundTitle) => {
	desiredTitle = desiredTitle.split(' ')
	foundTitle = foundTitle.split(' ')
	desiredTitle = desiredTitle.filter((word) => {
		return ! ((new RegExp(/\W/)).test(word) || word == '')
	})
	foundTitle = foundTitle.filter((word) => {
		return ! ((new RegExp(/\W/)).test(word) || word == '')
	})
	let covers = 0;
	for (let i = 0; i < desiredTitle.length; i++) {
		if (foundTitle.includes(desiredTitle[i])) {
			covers++
		}
	}

	return 1.5 * (covers / desiredTitle.length)  - (Math.abs(desiredTitle.length , foundTitle.length) / (desiredTitle.length + foundTitle.length))
}
const rateVideo = (video, index, desiredTitle) => {
	let rate = 0;
	const title = video.title.toLowerCase()
	const desc = video.description.toLowerCase()
	// pros
	rate += titleCoverage(title, desiredTitle.toLowerCase());

	if (index == 0) {
		rate++
	}
	if (title.indexOf('audio') >= 0) {
		rate++
	}
	if (title.indexOf('official') >= 0 || desc.indexOf('official') >= 0) {
		rate++
	}
	if (desc.indexOf('listen') >= 0) {
		rate++
	}
	//cons
	if (title.indexOf('video') >= 0) {
		rate--;
	}
	if (desc.indexOf('watch') >= 0) {
		rate--
	}
	if (title.indexOf('branch') >= 0) {
		//console.log(video, rate);
	}
	return rate
}
const sort = {
	byAudioFormat : (format1, format2) => {
		if (format1.audioBitrate > format2.audioBitrate) {
			return -1
		}
		if (format1.audioBitrate < format2.audioBitrate) {
			return 1
		}
		if (format1.audioBitrate == format2.audioBitrate) {
			return 0
		}
	},
	byRate : (songA, songB) => {
		if (songA.rate < songB.rate) {
			return 1
		}
		if (songA.rate == songB.rate) {
			return 0
		}
		if (songA.rate > songB.rate) {
			return -1
		}
	}
}

class TaskQueue {
	constructor(executeTask, name) {
		this.queue = [];
		this.currentTask = null;
		this._executeTask = executeTask;
		this.name = name
	}
	add(taskInfo, resolve) {
		this.queue.push({taskInfo, resolve})
		console.log('Queue', this.name, ":", this.queue.length)
		this._executeNext()
	}
	_executeNext() {
		if (!this.currentTask && this.queue.length > 0) {
			const {taskInfo, resolve} = this.queue.shift()			
			this.currentTask = this._executeTask(taskInfo)
			this.currentTask.then((data) => {
				resolve(data)
				this.currentTask = null;
				this._executeNext()
			})
		}
	}
}
const logError = (from) => (err) => {
	console.error(from, ': Error', err);
}
const comparePlaylists = (newPlaylists, currentPlaylists) => {
	if (currentPlaylists == null) {
		return newPlaylists
	}
	else {
		const playlistsToDownload = {}
		const newPlaylistsNames = Object.keys(newPlaylists)
		const currentPlaylistsNames = Object.keys(currentPlaylists)
		newPlaylistsNames.forEach((name) => {
			if (!currentPlaylistsNames.includes(name)) {
				playlistsToDownload[name] = newPlaylists[name] // copy all tracks from new playlist				
			}
			else { // otherwise copy only new tracks in playlist
				const currentPlaylistsSongsIds = currentPlaylists[name].map(({id, title})=>(id))
				playlistsToDownload[name] = newPlaylists[name].filter(({id, title}) => {
					return !currentPlaylistsSongsIds.includes(id)
				})
			}	
		})
		return playlistsToDownload
	}
}
const readFileAsJSON = (_path) => {
	return fs.existsSync(_path) ? JSON.parse(fs.readFileSync(_path)) : null
}
const saveObjectToFile = (_path, data) => {
	return fs.writeFileSync(_path, JSON.stringify(data))
}

const PromiseQueue = (actions) => {
  return new Promise((resolve, reject) => {
    const execute = () => {
      return actions.shift()().then(() => {
        if (actions.length > 0) {
          return execute()
        } else {
          resolve()
        }
      })
    }
    execute()
  })
}

module.exports = {
	deleteFolderRecursive,
	rateVideo,
	titleCoverage,
	sort,
	TaskQueue,
	logError,
	comparePlaylists,
	readFileAsJSON,
	saveObjectToFile,
	PromiseQueue
}