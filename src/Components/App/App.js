import React, { Component } from 'react';
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import Spotify from '../../util/Spotify';
import './App.css';


class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      searchResults: [/*
      {name: 'Bad Romance', artist: 'Lady Gaga', album: 'The Fame', id: '6rqhFjbbKwnb9MLmUQDhG8', uri: 'spotify:track:6rqhFgbbKwnb9MLmUQDhG6'},
      {name: 'Roots', artist: 'Imagine Dragon', album: 'Roots', id: '6rqhFgbbKwnbEMLmUQDhG5', uri:'spotify:track:3ypEkkF1BKWni32Ybod9gv'},
      {name: 'I Write Sins, Not Tragedies', artist: 'Panic! at the Disco', album: 'A Fever You Can\'t Sweat Out', id: '6rqhFgbbKwnb9MLmUQEhG5', uri:'spotify:track:1mea3bSkSGXuIRvnydlB5b'}
    */],
    playlistName: 'My Hardcoded Playlist',
    playlistTracks: [/*
      {name: 'Blue (Da Ba Dee)', artist: 'Eiffel 65', album: 'Europop', id: '6rqhFfwaKwnb9MLmUQDhG8', uri:'spotify:track:2yAVzRiEQooPEJ9SYx11L3'},
      {name: 'Lean On', artist: 'Major Lazer & DJ Snake', album: 'Peace is the Mission', id: '6rqhFgbbKwnbEMLmUQD34f', uri:'spotify:track:5wldXGLEOoRXxMWJ8rIUWE'},
      {name: 'Cheap Thrills', artist: 'Sia', album: 'This is Acting', id: '6rqhFgbbKwnb9MLmUQ405L', uri:'spotify:track:3S4px9f4lceWdKf0gWciFu'}
    */]
  };
  this.addTrack = this.addTrack.bind(this);
  this.removeTrack = this.removeTrack.bind(this);
  this.updatePlaylistName = this.updatePlaylistName.bind(this);
  this.savePlaylist = this.savePlaylist.bind(this);
  this.search = this.search.bind(this);
  }
  addTrack(track){
      if(this.state.playlistTracks.find(existingTrack => existingTrack.id === track.id)){
        return;
      } else{
        const currentPlaylistTracks = this.state.playlistTracks;
        currentPlaylistTracks.push(track);
        this.setState({playlistTracks: currentPlaylistTracks});
      }
    }
  removeTrack(track){
    const currentPlaylistTracks = this.state.playlistTracks;
    let filteredPlaylistTracks = currentPlaylistTracks.filter(currentTrack =>{
      if(currentTrack.id !== track.id){
        return currentTrack;
      }else {
        return null;
      }
    });
    this.setState({playlistTracks: filteredPlaylistTracks});
  }
  updatePlaylistName(newPlaylistName){
    this.setState({playlistName: newPlaylistName});
    console.log(this.state.playlistName);
  }
  async savePlaylist(){
    let trackURIs = [];
    this.state.playlistTracks.forEach(track => trackURIs.push(track.uri));
    await Spotify.savePlaylist(this.state.playlistName, trackURIs);
    this.setState({playlistName: 'New Playlist', playlistTracks: []});
  }
  async search(searchTerm){
    let newSearchResults = await Spotify.search(searchTerm);
    this.setState({searchResults : newSearchResults});
  }
  render() {
    return (
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        <div className="App">
          <SearchBar onSearch={this.search} />
          <div className="App-playlist">
          <SearchResults searchResults={this.state.searchResults} onAdd={this.addTrack} />
          <Playlist playlistName={this.state.playlistName} playlistTracks={this.state.playlistTracks} onRemove={this.removeTrack} onNameChange={this.updatePlaylistName} onSave={this.savePlaylist} />
        </div>
      </div>
    </div>
    );
  }
}

export default App;
