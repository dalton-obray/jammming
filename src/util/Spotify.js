let userAccessToken;
let expiresIn = '';
//const clientID='7040b83d72a5426eba5fdf3a313fd905';
const clientID= '682b48068f51420cb5ea494cf206a8b9';
const redirectUri = "http://jammming-with-dalton.surge.sh/";
//const redirectUri = "http://localhost:3000/";

const Spotify = {
  getAccessToken(){
    //If the access token is already set, return it
    if(userAccessToken){
      return userAccessToken;
    }
    //check to see if the access token and expiresIn time have just been returned in the url
    let extractAccessToken = window.location.href.match(/access_token=([^&]*)/);
    let extractExpireTime = window.location.href.match(/expires_in=([^&]*)/);
    if(extractAccessToken && extractExpireTime){
        userAccessToken = extractAccessToken[1];
        expiresIn = extractExpireTime[1];
        window.setTimeout(() => userAccessToken = '', expiresIn * 1000);
        window.history.pushState('Access Token', null, '/');
        return userAccessToken;
   //If we still don't have the token, redirect the user to the Spotify site to get one
    } else{
      const authorizeUrl = "https://accounts.spotify.com/authorize";
      const responseType = "token";
      const endpoint = `${authorizeUrl}?client_id=${clientID}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=playlist-modify-public%20playlist-modify-private%20user-read-private`;
      window.location=endpoint;
    }
  },
  async search(searchTerm){
    if(!userAccessToken){
      userAccessToken = this.getAccessToken();
    }
    //make a GET request to the Spotify search endpoint. If the response is successful, store the items we need in an array and return it
    try {
      const searchUrl = "https://api.spotify.com/v1/search";
      const params = "type=track";
      const endpoint = `${searchUrl}?${params}&q=${searchTerm}`;
      const response = await fetch(endpoint, {
        headers: {'Authorization': `Bearer ${userAccessToken}`}
      });
      if(response.ok){
          const jsonResponse = await response.json();
          console.log(jsonResponse);
        //if the response contains tracks, map the tracks to an array
          if(jsonResponse.tracks){
            let jsonResponseTracks= jsonResponse.tracks.items.map(track => {
                return {
                  name: track.name,
                  artist: track.artists[0].name,
                  album: track.album.name,
                  id: track.id,
                  uri: track.uri
                }
            });
          console.log(jsonResponseTracks);
          return jsonResponseTracks;
        } else{
          return [];
        }
      } else{
        throw new Error('Request Failed!');
      }
    } catch(error){
      console.log(error);
    }
  },
  async getUserId(userAccessToken){
  let authHeaders = {'Authorization': `Bearer ${userAccessToken}`};
  //let userId = '';
  const userProfileUrl = "https://api.spotify.com/v1/me";
  //GET the users ID from their account
  try {
    const response = await fetch(userProfileUrl, {headers: authHeaders});
      if (response.ok){
        const jsonResponse = await response.json();
        return jsonResponse.id;
      } else {
        throw new Error('Get User ID Request Failed!');
      }
    } catch(error){
        console.log(error);
      }
},
  async createUserPlaylist(userAccessToken, playlistName){
    //Create a playlist in the user's account
    try{
      let userId = await this.getUserId(userAccessToken);
      console.log(userId);
      const createPlaylistEndpoint = `https://api.spotify.com/v1/users/${userId}/playlists`;
      const response = await fetch(createPlaylistEndpoint, {
        method: 'POST',
        headers: {'Authorization' : `Bearer ${userAccessToken}`},
        body: JSON.stringify({ 'name' : playlistName})
        });
      if (response.ok){
        const jsonResponse = await response.json();
        let playlistId = jsonResponse.id;
        return playlistId;
      } else {
          throw new Error('Create Playlist Request Failed!');
        }
      } catch(error){
          console.log(error);
      };
  },
  async addTracksToPlaylist(userAccessToken, playlistName, trackURIs){
    //Add tracks to the new playlist
      let playlistId = await this.createUserPlaylist(userAccessToken, playlistName);
      const addTrackToPlaylistUrl = "https://api.spotify.com/v1/playlists/";
      try{
        const addTracksEndpoint = `${addTrackToPlaylistUrl}${playlistId}/tracks`;
        const response = await fetch(addTracksEndpoint, {
          method: 'POST',
          body: JSON.stringify({"uris": trackURIs}),
          headers: {'Authorization': `Bearer ${userAccessToken}`}
          });
        if (response.ok){
          const jsonResponse = await response.json();
          let playlistSnapshotId = jsonResponse.snapshot_id;
          return playlistSnapshotId;
        } else {
            throw new Error('Add Track Request Failed!');
          }
        } catch(error){
            console.log(error);
        };
  },
async savePlaylist(playlistName, trackURIs){
      if(playlistName && trackURIs){
          userAccessToken = this.getAccessToken();
          //let playlistId = await this.createUserPlaylist(userAccessToken, playlistName);
          let playlistSnapshotId = await this.addTracksToPlaylist(userAccessToken, playlistName, trackURIs);
          console.log(`Your User Access token is ${userAccessToken}.  Your playlistName is ${playlistName}. Your Playlist Snapshot Id is ${playlistSnapshotId}.`);
          } else {
        console.log("It didn't work.");
        return null;
      }
  }
};

export default Spotify;
