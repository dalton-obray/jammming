let userAccessToken = '';
let expiresIn = '';
const clientID='7040b83d72a5426eba5fdf3a313fd905';
const redirectUri = "http://localhost:3000/";

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
      this.getAccessToken();
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
savePlaylist(playlistName, trackURIs){
      if(playlistName && trackURIs){
        userAccessToken = this.getAccessToken();
        let authHeaders = {'Authorization': `Bearer ${userAccessToken}`};
        let userId = '';
        let playlistId = '';
        const userProfileUrl = "https://api.spotify.com/v1/me";
        const createPlaylistUrl = "https://api.spotify.com/v1/users/";
        const addTrackToPlaylistUrl = "https://api.spotify.com/v1/playlists/";
        //GET the users ID from their account
        try {
          const response = await fetch(userProfileUrl, {headers: authHeaders});
            if (response.ok){
              const jsonResponse = await response.json();
              userId = jsonResponse.id;
            } else {
              throw new Error('Get User ID Request Failed!');
            }
          } catch(error){
              console.log(error);
          };
      //Create a playlist in the user's account
      try{
        const createPlaylistEndpoint = `${createPlaylistUrl}${userId}/playlists`;
        const response = await fetch(createPlaylistEndpoint, {
          method: 'POST',
          headers: {'Authorization': `Bearer ${userAccessToken}`, 'Content-Type': 'application/json'},
          body: {
            "name": playlistName
          }
          });
        if (response.ok){
          const jsonResponse = await response.json();
          playlistId = jsonResponse.id;
        } else {
            throw new Error('Create Playlist Request Failed!');
          }
        } catch(error){
            console.log(error);
        };
      //Add tracks to the new playlist
        try{
          const addTracksEndpoint = `${addTrackToPlaylistUrl}${playlistId}/tracks`;
          const response = await fetch(addTracksEndpoint, {
            method: 'POST',
            headers: {'Authorization': `Bearer ${userAccessToken}`, 'Content-Type': 'application/json'},
            body: {
              "uris": trackURIs
            }
            });
          if (response.ok){
            const jsonResponse = await response.json();
            playlistId = jsonResponse.id;
          } else {
              throw new Error('Create Playlist Request Failed!');
            }
          } catch(error){
              console.log(error);
          };

      } else {
        return;
      }
  }
};

export default Spotify;