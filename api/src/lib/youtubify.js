const fs = require('fs');
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
			    	description : item.snippet.description
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

const downloadFromYoutube = (videoId, fileName) => {
	return new Promise((resolve, reject) => {
		const outPath = `${fileName}.mp4`
	  const downloadStream = ytdl(`https://www.youtube.com/watch?v=${videoId}`, {
	      filter: (arg) => {
	        console.log(arg)
	        return arg.container == 'mp4'
	      }
	    })
	  downloadStream.pipe(fs.createWriteStream(outPath));
	  downloadStream.on('end', () => {
		console.log('download stream end', outPath);
	  	resolve(outPath)
	  })
	  downloadStream.on('error', (err) => {
		console.log('download stream error')
	  	resolve(err)
	  })
	})
   // resolve promise when ended
}

const convertMp4toMp3 = (inFilePath, outFilePath) => {
	return new Promise((resolve, reject) => {
		const args = ['-i', inFilePath, '-vn', '-ab', '320k', '-y', outFilePath];
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
const userId = '11156868367'
authenticateSpotify()
.then((spotifyApi) => {
	return getUserPlaylists(spotifyApi)(userId)
		.then((playlists) => {
			return playlists.filter((playlist) => {
				return playlist.name == "deep Chill"
			})
		})
		.then((desiredPlaylist) => {
			//console.log(desiredPlaylist)
			return desiredPlaylist[0].id
		})
		.then((playlistId) => {
			//console.log(playlistId)
			return getPlaylistTracks(spotifyApi)(userId, playlistId)
		})
		.then((tracks) => {
			//tracks = tracks.slice(0,3);
			console.log(tracks)
			return Promise.all(tracks.map(findOnYoutube))
		})
		.then((youTubeIds) => {
			console.log(youTubeIds.map((song) => (song.id)))
			console.log('downloading');
			return downloadFromYoutube(youTubeIds[4].id, youTubeIds[4].title)
		})
		.then((outputFile) => {
			console.log('file downloaded!', outputFile) 
			return convertMp4toMp3(outputFile, outputFile.substr(0, outputFile.length-1) + '3')
		})
		.then((some) => {
			console.log('convertEnd')
			console.log(some);
		})
		.catch((err) => {
			console.log(err)
		})
})


// get spotify playlists
// compare to downloaded one
// get not downloaded
// search on yputube api
// get info from tracks to download
// select format mp3 if avaliable or mp4 and conver later // avconv  -i fileIN -vn -ab 320k fileOUT

