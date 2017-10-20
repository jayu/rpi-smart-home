// + check convertion on device 
// + delete temp dirs
// * delete mp4 after conversion
// check track list response line 145
// file compare
// authenticate spotify to get private
// playlistNameChange ??? 


const fs = require('fs');
const path = require('path')
const ytdl = require('ytdl-core');
const SpotifyWebApi = require('spotify-web-api-node');
const { spawn, execFile } = require('child_process')
const youTube = new(require('youtube-node'))()

const {sendToAll} = require('../ws')

const { 
	deleteFolderRecursive, 
	titleCoverage, 
	rateVideo, 
	sort, 
	TaskQueue, 
	comparePlaylists, 
	readFileAsJSON,
	saveObjectToFile,
	logError,
} = require('./utils')
const { byRate, byAudioFormat } = sort
const { spotify, yt } = require('./credentials.js');

youTube.setKey(yt);


const findOnYoutube = (title) => {
  return new Promise((resolve, reject) => {
    youTube.search(title, 5, function(error, result) {
      if (error) {
        console.log(error);
      } else {
        const bestMatchingVideo = result.items
          .filter((item) => {
            return item.id.kind.indexOf('video') >= 0;
          })
          .map((item) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            desiredTitle: title
          }))
          .map((song, index) => {
            song.rate = rateVideo(song, index, title)
            return song
          })
          .sort(byRate)[0]
        resolve(bestMatchingVideo)
      }
    });
  })
}
// Roger Waters wait f....
const getBestYTFormat = (videoId) => {
  return ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`)
    .then((info) => {
        info.formats.sort(byAudioFormat)
        return info.formats[0]
      })
}

const _downloadFromYoutube = (videoId, filePath, writable) => {
  return new Promise((resolve, reject) => {
    getBestYTFormat(videoId)
      .then((format) => {
        const outputPath = `${filePath}.${format.container}`
        const downloadStream = ytdl(`https://www.youtube.com/watch?v=${videoId}`, { format })
        if (writable) {
          downloadStream.pipe(writable);
        } else {
          downloadStream.pipe(fs.createWriteStream(outputPath));
        }
        downloadStream.on('end', () => {
          resolve({ outputPath, bitrate: format.audioBitrate })
        })
        downloadStream.on('error', (err) => {
          resolve(err)
        })
      })
  })
}
const _convertMp4toMp3 = (inFilePath, outFilePath, bitrate) => {
  return new Promise((resolve, reject) => {
    //console.log("converting", inFilePath, "started")
    const args = ['-i', inFilePath, '-vn', '-ab', bitrate ? `${bitrate}k` : '320k', '-y', outFilePath];
    const converter = spawn('avconv', args)
    //converter.stdout.pipe(process.stdout);
    //converter.stderr.pipe(process.stderr);
    converter.on('exit', () => {
      //console.log('conversion success', inFilePath)
      resolve(outFilePath)
    })
    converter.on('error', (err) => {
      //console.log('conversion error', inFilePath, err)
      resolve(err)
    })
  })
}

const downloadQueue = new TaskQueue((taskInfo) => {
  const { videoId, fileName, writable } = taskInfo;
  return _downloadFromYoutube(videoId, fileName, writable);
}, "downloadQueue");

const convertQueue = new TaskQueue((taskInfo) => {
  //console.log("next task from convert queue", taskInfo)
  const { inFilePath, outFilePath, bitrate } = taskInfo;
  return _convertMp4toMp3(inFilePath, outFilePath, bitrate);
}, "convertQueue");

const downloadFromYoutube = (videoId, fileName, writable) => {
  return new Promise((resolve, reject) => {
    downloadQueue.add({ videoId, fileName, writable }, resolve);
  })
}

const convertMp4toMp3 = (inFilePath, outFilePath, bitrate) => {
  return new Promise((resolve, reject) => {
    convertQueue.add({ inFilePath, outFilePath, bitrate }, resolve);
  })
}

const authenticateSpotify = () => {
  const spotifyApi = new SpotifyWebApi({
    clientId: spotify.clientId,
    clientSecret: spotify.clientSecret,
  })

  return spotifyApi.clientCredentialsGrant()
    .then(function(data) {
      spotifyApi.setAccessToken(data.body['access_token']);
      return spotifyApi
    }, logError('Spotify API'))
}
// my user id '11156868367'
const getUserPlaylists = (spotifyApi) => (userId) => {
  return spotifyApi.getUserPlaylists(userId)
    .then(function(data) {
      return data.body.items
    }, logError('Spotify API'));
}

const getPlaylistTracks = (spotifyApi) => (userId, playlistId) => {
  return spotifyApi.getPlaylist(userId, playlistId)
    .then(function(data) {
      const songsList = data.body.tracks.items.map((track) => ({id : track.track.id, title : `${track.track.artists[0].name} - ${track.track.name}`}))
      return songsList
    }, logError('Spotify API'));
}

const stateNotifier = () => {
  let _total = 0;
  let _done  = 0;
  return (total = _total) => {
    _total = total
    _done++
    sendToAll({
      type : "SPOTIFY_SYNC_STATE",
      state : `${_done}/${total}`
    })
  }
}
const updateSpotifySongs = (userId, ommitPlaylists, outDir) => {
  return authenticateSpotify()
    .then((spotifyApi) => {
        return getUserPlaylists(spotifyApi)(userId)
          .then((playlists) => {
            return playlists.filter((playlist) => {
              return !ommitPlaylists.includes(playlist.name)
            })
          })
          .then((desiredPlaylist) => {
            return desiredPlaylist.map((p) => ({ id: p.id, name: p.name }))
          })
          .then((playlists) => {
              return Promise.all(playlists.map(({ id }) => (getPlaylistTracks(spotifyApi)(userId, id))))
                .then(playlistsTracks => {
                  playlistsList = {};

                  playlistsTracks.map((playlistTracks, i) => {
                    playlistsList[playlists[i].name] = playlistTracks
                  })

                  return playlistsList
                })
          })
      .then((playlistsList) => {
        playlistsInfoPath = path.join(outDir, 'playlists.json')
        downloadedPlaylists = readFileAsJSON(playlistsInfoPath)
        const playlistsListCompared = comparePlaylists(playlistsList, downloadedPlaylists)
        saveObjectToFile(playlistsInfoPath, playlistsList)
        const playlistsToDownload = {}
        Object.keys(playlistsListCompared).forEach((playlistName) => {
          playlistsToDownload[playlistName] = playlistsListCompared[playlistName].map((song) => (song.title))
        })
        return playlistsToDownload
      })
      .then((playlistsList) => {
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
        const notifier = stateNotifier()
        const allDownloads = []
        Object.keys(playlistsTracksToDownload).forEach((playlistName) => {
          playlistsTracksToDownload[playlistName].forEach(({ desiredTitle, id }) => {
            const tempDirectory = path.join(outDir, `temp_${playlistName}`)
            const tempFilePath = path.join(tempDirectory, desiredTitle)
            if (!fs.existsSync(tempDirectory)) {
              fs.mkdirSync(tempDirectory);
            }
            allDownloads.push(
              downloadFromYoutube(id, tempFilePath)
              .then(({ outputPath, bitrate }) => {
                const targetDirectory = path.join(outDir, playlistName)
                const targetFilePath = path.join(targetDirectory, desiredTitle) + ".mp3"
                if (!fs.existsSync(targetDirectory)) {
                  fs.mkdirSync(targetDirectory);
                }
                console.log(desiredTitle, "downloaded")
                return convertMp4toMp3(outputPath, targetFilePath, bitrate)
                  .then((convertedFile) => {
                    fs.unlinkSync(outputPath);
                    notifier()
                    console.log("File", convertedFile, "downloaded and converted");
                    return convertedFile
                  })
              })
            )
          })
        })
        notifier(allDownloads.length)
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
        return(allDownloads)
        console.log('Whole task finnished:', allDownloads);
      })
      .catch(logError('updateSpotifySongs'))
    })
}

module.exports = {
  downloadFromYoutube,
  updateSpotifySongs
}


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