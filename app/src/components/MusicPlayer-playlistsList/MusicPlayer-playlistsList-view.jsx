import React from 'react'

const PlaylistsListView = (props) => {
  const playlists = [];
  Object.keys(props.playlists).forEach((playlistName) => {
    playlists.push(
      <li className="playlist" key={playlistName} onClick={props.playPlaylist(playlistName)}>
          <p className="playlistName">{playlistName}</p>
          <ol className="songsList">
            {props.playlists[playlistName].map((song) => {
              return (
                <li className="songName" key={song.name} onClick={props.playSong(playlistName, song.name)}>{song.name}</li>
              )
            })}
          </ol>
      </li>
    )
  })
	return (
    <div className="PlaylistsListContainer">
      <ul className="PlaylistsList">
        {playlists}
        {playlists}
      </ul>
    </div>
	)
}

export default PlaylistsListView
