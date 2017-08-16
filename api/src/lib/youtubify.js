// check convertion on device
// delete temp dirs
// file compare
// authenticate spotify to get private


const fs = require('fs');
const path = require('path')
const ytdl = require('ytdl-core');
const SpotifyWebApi = require('spotify-web-api-node');
const { spotify, yt } = require('./credentials.js');
const { spawn, execFile } = require('child_process')
const YouTube = require('youtube-node');
const youTube = new YouTube();
youTube.setKey(yt);
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
	//console.log(desiredTitle, foundTitle)

	//console.log(covers, desiredTitle.length, foundTitle.length)

	//console.log('\n', (covers / desiredTitle.length)  - (Math.abs(desiredTitle.length , foundTitle.length) / (desiredTitle.length + foundTitle.length)), '\n')
	//console.log('test')

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
const findOnYoutube = (title) => {
	return new Promise((resolve, reject) => {
		youTube.search(title, 5, function(error, result) {
		  if (error) {
		    console.log(error);
		  }
		  else {
		    //console.log(JSON.stringify(result, null, 2));
		    resolve(
			    result.items
			    .filter((item) => {
			    	return item.id.kind.indexOf('video') >= 0;
			    })
			    .map((item) => ({
			    	id : item.id.videoId, 
			    	title : item.snippet.title, 
			    	description : item.snippet.description,
			    	desiredTitle : title
			    }))
			    .map((song, index) => {
			    	//console.log('########################################################################################')
			    	//console.log('rate', song.title)
			    	song.rate = rateVideo(song, index, title)

			    	console.log(song.title, song.rate)
			    	return song
			    })
			    .sort((songA, songB) => {
			    	if (songA.rate < songB.rate) {
			    		return 1
			    	}
			    	if (songA.rate == songB.rate) {
			    		return 0
			    	}
			    	if (songA.rate > songB.rate) {
			    		return -1
			    	}
			    })[0]
			   )
		  }
		});
	})
}

const getBestYTFormat = (videoId) => {
	return ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`)
	.then((info) => {
		info.formats.sort((format1, format2) => {
			if (format1.audioBitrate > format2.audioBitrate) {
				return -1
			}
			if (format1.audioBitrate < format2.audioBitrate) {
				return 1
			}
			if (format1.audioBitrate == format2.audioBitrate) {
				return 0
			}
		})
		return info.formats[0]
	})
}

const _downloadFromYoutube = (videoId, fileName, writable) => {
	return new Promise((resolve, reject) => {
		getBestYTFormat(videoId)
		.then((format) => {
			const outputPath = `${fileName}.${format.container}`
			console.log('downloading file', outputPath, " with bitrate ", format.audioBitrate)
		  const downloadStream = ytdl(`https://www.youtube.com/watch?v=${videoId}`, {format})
		  if (writable) {
		  	downloadStream.pipe(writable);
		  }
		  else {
		  	downloadStream.pipe(fs.createWriteStream(outputPath));
		  }
		  downloadStream.on('end', () => {
			console.log('download stream end', outputPath);
		  	resolve({outputPath, bitrate : format.audioBitrate})
		  })
		  downloadStream.on('error', (err) => {
			console.log('download stream error')
		  	resolve(err)
		  })
		})
	})
}
const _convertMp4toMp3 = (inFilePath, outFilePath, bitrate) => {
	return new Promise((resolve, reject) => {
		const args = ['-i', inFilePath, '-vn', '-ab', bitrate ? `${bitrate}k` : '320k', '-y', outFilePath];
		console.log(args)
		const converter = spawn('avconv', args)
		console.log('conversion start');
		converter.stdout.pipe(process.stdout)
		converter.stdout.on('data', function(data) {
		    console.log("converter : ", data.toString()); 
		});
		converter.on('exit', () => {
			resolve(outFilePath)
		})
		converter.on('error', (err) => {
			console.log('converter error')
		})
	})
}
class DownloadQueue {
	constructor() {
		this.queue = [];
		this.currentDownload = null;
	}
	add(trackInfo, resolve) {
		this.queue.push({trackInfo, resolve})
		console.log("###### Download Queue length", this.queue.length)
		this._download()
	}
	_download() {
		if (!this.currentDownload && this.queue.length > 0) {
			const self = this;
			const {trackInfo, resolve} = this.queue.shift()
			const {videoId, fileName, writable} = trackInfo;
			this.currentDownload = _downloadFromYoutube(videoId, fileName, writable);
			this.currentDownload.then((info) => {
				resolve(info)
				this.currentDownload = null;
				this._download()
			})
		}
	}
}
class ConvertQueue {
	constructor() {
		this.queue = [];
		this.currentConvert = null;
	}
	add(trackInfo, resolve) {
		this.queue.push({trackInfo, resolve})
		console.log("###### Convert Queue length", this.queue.length)
		this._convert()
	}
	_convert() {
		if (!this.currentConvert && this.queue.length > 0) {
			const self = this;
			const {trackInfo, resolve} = this.queue.shift()
			const {inFilePath, outFilePath, bitrate} = trackInfo;
			this.currentConvert = _convertMp4toMp3(inFilePath, outFilePath, bitrate);
			this.currentConvert.then((info) => {
				resolve(info)
				this.currentConvert = null;
				this._convert()
			})
		}
	}
}
const downloadQueue = new DownloadQueue();

const convertQueue = new ConvertQueue();

const downloadFromYoutube = (videoId, fileName, writable) => {
	return new Promise((resolve, reject) => {
		downloadQueue.add({videoId, fileName, writable}, resolve);
	})
}

const convertMp4toMp3 = (inFilePath, outFilePath, bitrate) => {
	return new Promise((resolve, reject) => {
		convertQueue.add({inFilePath, outFilePath, bitrate}, resolve);
	})
}

const authenticateSpotify = () => {
  const spotifyApi = new SpotifyWebApi({
    clientId: spotify.clientId,
    clientSecret: spotify.clientSecret,
  })

  return spotifyApi.clientCredentialsGrant()
    .then(function(data) {
      // console.log('The access token expires in ' + data.body['expires_in']);
      // console.log('The access token is ' + data.body['access_token']);
      // Save the access token so that it's used in future calls
      spotifyApi.setAccessToken(data.body['access_token']);
      return spotifyApi

    }, function(err) {
      console.log('Something went wrong when retrieving an access token', err.message);
    })
  }
// my user id '11156868367'
  const getUserPlaylists = (spotifyApi) => (userId) => {
  	return spotifyApi.getUserPlaylists(userId)
      .then(function(data) {
        //console.log('Retrieved playlists', data.body);
        //console.log('tracks', data.body.items[5].tracks)
        return data.body.items
      }, function(err) {
        console.log('Something went wrong!', err);
      });
  }

  const getPlaylistTracks = (spotifyApi) => (userId, playlistId) => {
  	return spotifyApi.getPlaylist(userId, playlistId)
      .then(function(data) {
      	const songsList = data.body.tracks.items.map((track) => (`${track.track.artists[0].name} - ${track.track.name}`))
        //console.log('Some information about this playlist', songsList);
        return songsList
      }, function(err) {
        console.log('Something went wrong!', err);
      });
  }
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
  //  #1

    // spotifyApi.getMySavedTracks({ // requires authentication scope : user-library-read
    //     limit: 2,
    //     offset: 1
    //   })
    //   .then(function(data) {
    //     console.log('Done!');
    //     console.log(data.body);
    //   }, function(err) {
    //     console.log('Something went wrong!', err);
    //   });

// getYoutubeId('21 savage savage mode').then((id) => {
// 	console.log(id);
// })
const updateSpotifySongs = (userId, ommitPlaylists, outDir) => {
	authenticateSpotify()
	.then((spotifyApi) => {
		return getUserPlaylists(spotifyApi)(userId)
			.then((playlists) => {
				return playlists.filter((playlist) => {
					return !ommitPlaylists.includes(playlist.name)
				})
			})
			.then((desiredPlaylist) => {
				console.log(desiredPlaylist.map((p) => (p.name)))
				return desiredPlaylist.map((p) => ({id : p.id, name : p.name}))
			})
			.then((playlists) => {
				console.log(playlists)
				return Promise.all(playlists.map(({id}) => (getPlaylistTracks(spotifyApi)(userId, id) )))
					.then(playlistsTracks => {
						console.log(playlistsTracks)
						playlistsList = {};

						playlistsTracks.map((playlistTracks, i) => {
							playlistsList[playlists[i].name] = playlistTracks
						})

						return playlistsList
					})
			})
			.then((playlistsList) => {
				//tracks = tracks.slice(0,3);
				console.log(playlistsList)
				const tracksSearchings = [];
				Object.keys(playlistsList).forEach((playlistName) => {
					tracksSearchings.push(Promise.all(playlistsList[playlistName].map(findOnYoutube)))
				})
				return Promise.all(tracksSearchings)
					.then((playlistsYoutubeTracks) => {
						const playlistsTracksToDownload = {}
						Object.keys(playlistsList).forEach((playlistName, i) => {
							playlistsTracksToDownload[playlistName] = playlistsYoutubeTracks[i]
						})
						return playlistsTracksToDownload
					})
			})
			.then((playlistsTracksToDownload) => {
				console.log(playlistsTracksToDownload);
				const allDownloads = []
				Object.keys(playlistsTracksToDownload).forEach((playlistName) => {
					console.log(playlistName)
					console.log(playlistsTracksToDownload[playlistName].map(({desiredTitle, id}) => ({desiredTitle,id})))
					playlistsTracksToDownload[playlistName].forEach(({desiredTitle, id}) => {
						const tempDirectory = path.join(outDir, `temp_${playlistName}`)
						const tempFilePath = path.join(tempDirectory, desiredTitle)
						if (!fs.existsSync(tempDirectory)) {
							fs.mkdirSync(tempDirectory);
						}
						console.log(tempDirectory, tempFilePath)
						allDownloads.push(
								downloadFromYoutube(id, tempFilePath) // make it queueuueeuueeueueueueuuue
								.then(({ outputPath, bitrate }) => {
									console.log('file downloaded!', outputPath)
									const targetDirectory = path.join(outDir, playlistName)
									const targetFilePath =  path.join(targetDirectory, desiredTitle) + ".mp3"
									if (!fs.existsSync(targetDirectory)) {
    								fs.mkdirSync(targetDirectory);
									}
									console.log(targetDirectory, targetFilePath);
									return "Fake file"//convertMp4toMp3(outputPath, targetFilePath, bitrate) // make it queueueueueueu
								})
								.then((convertedFile) => {
									//TODO  delete mp4 file here
									console.log("File", convertedFile, "downloaded and converted");
									return convertedFile
								})
							)
					})
				})
				//console.log(youTubeIds.map((song) => (song.id)))
				//console.log('downloading');
				//return downloadFromYoutube(youTubeIds[4].id, youTubeIds[4].title)
				return Promise.all(allDownloads)
					.then((allDownloads) => {
						Object.keys(playlistsTracksToDownload).forEach((playlistName) => {
							const tempDirectory = path.join(outDir, `temp_${playlistName}`)
							deleteFolderRecursive(tempDirectory)
						})
						return allDownloads
					})
			})
			.then((allDownloads) => {
				console.log('whole task finnished', allDownloads);

			})
			.catch((err) => {
				console.log(err)
			})
	})
}

// downloadFromYoutube('bOzqpj3O3OY', 'piki')
// .then((outputPath) => {
// 	console.log(outputPath)
// })

// get spotify playlists
// compare to downloaded one
// get not downloaded
// search on yputube api
// get info from tracks to download
// select format mp3 if avaliable or mp4 and conver later // avconv  -i fileIN -vn -ab 320k fileOUT

module.exports = {
	downloadFromYoutube,
	updateSpotifySongs
}