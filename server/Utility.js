require("dotenv").config();
const SpotifyAPIBuilder = require("spotify-web-api-node");

const spotify = new SpotifyAPIBuilder({
  clientId: process.env.client_ID,
  clientSecret: process.env.client_SECRET,
  redirectUri: "http://localhost:4200/login",
});

/**
 * Exports the functions for calling the Spotify API
 * Helper functions are listed below the exports
 */
module.exports = class Utility {
  constructor() {}

  /* ***************** */
  /*       LOGIN       */
  /* ***************** */
  login(code) {
    return spotify
      .authorizationCodeGrant(code)
      .then((data) => {
        spotify.setAccessToken(data.body.access_token);
        spotify.setRefreshToken(data.body.refresh_token);
        data.statusCode = 200;
        return { expires: data.body.expires_in, status: 200 };
      })
      .catch((err) => {
        return {
          name: err.body.error,
          message: err.body.error_description,
          statusCode: err.statusCode,
        };
      });
  }

  /* ******************** */
  /*       PROFILE        */
  /* ******************** */

  getMe() {
    return spotify.getMe();
  }

  getFollowedArtists() {
    return spotify.getFollowedArtists().then((data) => {
      return convertToFollowedArtists(data);
    });
  }

  getMySavedAlbums() {
    return spotify.getMySavedAlbums().then((data) => {
      return convertMySavedAlbums(data);
    });
  }

  getMyTopTracks() {
    return spotify.getMyTopTracks().then((data) => {
      return convertToTopTracks(data);
    });
  }

  getMyTopArtists() {
    return spotify.getMyTopArtists().then((data) => {
      return convertToTopArtists(data);
    });
  }

  /* ********************** */
  /*        Playlist        */
  /* ********************** */

  createPlaylist(playlist) {
    console.log(playlist);
    return spotify
      .createPlaylist(playlist.name, {
        description: playlist.description,
        public: playlist.scope,
        collaborative: playlist.collaborative,
      })
      .then((data) => {
        return convertCreatePlaylist(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  getPlaylists() {
    return spotify.getUserPlaylists().then((data) => {
      return convertToUserPlaylist(data);
    });
  }

  getPlaylist(id) {
    return spotify.getPlaylist(id, { limit: 1 }).then(async (data) => {
      const songCount = data.body.tracks.total;
      return {
        id: data.body.id,
        name: data.body.name,
        description: data.body.description,
        owner: {
          id: data.body.owner.id,
          name: data.body.owner.display_name,
          type: data.body.owner.type,
          uri: data.body.owner.uri,
        },
        tracks: await convertToPlaylist(data.body.id, songCount),
        images: data.body.images,
        public: data.body.public,
        collaborative: data.body.collaborative,
        type: data.body.type,
        uri: data.body.uri,
      };
    });
  }

  getFeaturedPlaylists() {
    return spotify.getFeaturedPlaylists().then((data) => {
      return convertToFeaturedPlaylist(data);
    });
  }

  /* ****************** */
  /*       Artist       */
  /* ****************** */

  getArtistAlbums(id) {
    return spotify.getArtistAlbums(id).then((data) => {
      return convertArtistsAlbums(data);
    });
  }

  getArtistTopTracks(id, country) {
    return spotify.getArtistTopTracks(id, country).then((data) => {
      return convertTopArtistTracks(data);
    });
  }

  getArtistRelatedArtists(id) {
    return spotify.getArtistRelatedArtists(id).then((data) => {
      return convertRelatedArtists(data);
    });
  }

  /* ********* */
  /*   Test    */
  /* ********* */

  test(playlist) {
    return spotify
      .createPlaylist(playlist.name, {
        description: playlist.description,
        public: playlist.public,
        collaborative: playlist.collaborative,
      })
      .then((data) => {
        return convertCreatePlaylist(data);
      });
  }
};

/* ******************** */
/*       PROFILE        */
/* ******************** */

function convertToFollowedArtists(data) {
  return data.body.artists.items.map((artist) => {
    return {
      id: artist.id,
      name: artist.name,
      images: artist.images,
      type: artist.type,
      uri: artist.uri,
    };
  });
}

function convertMySavedAlbums(data) {
  return data.body.items.map((item) => {
    return {
      id: item.album.id,
      name: item.album.name,
      artist: {
        id: item.album.artists[0].id,
        name: item.album.artists[0].name,
        images: null,
        type: item.album.artists[0].type,
        uri: item.album.artists[0].uri,
      },
      images: item.album.images,
      type: item.album.type,
      uri: item.album.uri,
    };
  });
}

function convertToTopTracks(data) {
  return data.body.items.map((track) => {
    return {
      added_at: null,
      isLocal: track.is_local,
      album: {
        id: track.album.id,
        type: track.album.type,
        name: track.album.name,
        release: new Date(track.album.release_date),
        tracks: track.album.total_tracks,
        artists: track.album.artists.map((artist) => {
          return {
            id: artist.id,
            name: artist.name,
            type: artist.type,
            uri: artist.uri,
          };
        }),
        images: track.album.images,
        uri: track.album.uri,
      },
      artists: track.artists.map((artist) => {
        return {
          id: artist.id,
          name: artist.name,
          type: artist.type,
          uri: artist.uri,
        };
      }),
      duration: track.duration_ms,
      explicit: track.explicit,
      id: track.id,
      name: track.name,
      type: track.type,
      uri: track.uri,
    };
  });
}

function convertToTopArtists(data) {
  return data.body.items.map((artist) => {
    return {
      name: artist.name,
      id: artist.id,
      type: artist.type,
      followers: artist.followers.total,
      popularity: artist.popularity,
      genres: artist.genres,
      images: artist.images,
      uri: artist.uri,
    };
  });
}

/* ********************** */
/*        Playlist        */
/* ********************** */

function convertToUserPlaylist(data) {
  return data.body.items.map((item) => {
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      owner: {
        name: item.owner.display_name,
        id: item.owner.id,
        type: item.owner.type,
        uri: item.owner.uri,
      },
      images: item.images,
      public: item.public,
      collaborative: item.collaborative,
      type: item.type,
      uri: item.uri,
    };
  });
}

function convertToPlaylist(id, size) {
  const calls = Math.floor(size / 100) + 1;
  const offset = Array(calls)
    .fill(null)
    .map((_, i) => i * 100);
  const requests = offset.map((value) => {
    return spotify
      .getPlaylistTracks(id, { limit: 100, offset: value })
      .then((data) => {
        return data;
      });
  });
  return Promise.all(requests).then((responses) =>
    Promise.all(
      responses.flatMap((r) => {
        return r.body.items.map((item) => {
          return {
            id: item.track.id,
            name: item.track.name,
            album: {
              id: item.track.album.id,
              name: item.track.album.name,
              artist: null,
              date: new Date(item.track.album.release_date),
              images: item.track.album.images,
              type: item.track.album.type,
              uri: item.track.album.uri,
            },
            artist: {
              id: item.track.artists[0].id,
              name: item.track.artists[0].name,
              images: null,
              type: item.track.artists[0].type,
              uri: item.track.artists[0].uri,
            },
            duration: item.track.duration_ms,
            popularity: item.track.popularity,
            local: item.is_local,
            explicit: item.track.explicit,
            added: new Date(item.added_at),
            track: item.track.track_number,
            type: item.track.type,
            uri: item.track.uri,
          };
        });
      })
    ).then((data) => {
      return data;
    })
  );
}

function convertToFeaturedPlaylist(data) {
  return data.body.playlists.items.map((playlist) => {
    return {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      type: playlist.type,
      count: playlist.tracks.count,
      owner: {
        name: playlist.owner.display_name,
        id: playlist.owner.id,
        type: playlist.owner.type,
        uri: playlist.owner.uri,
      },
      public: playlist.public,
      collaborative: playlist.collaborative,
      images: playlist.images,
      uri: playlist.uri,
    };
  });
}

function convertCreatePlaylist(data) {
  return data;
}

/* ****************** */
/*       Artist       */
/* ****************** */

function convertArtistsAlbums(data) {
  return data.body.items.map((album) => {
    return {
      id: album.id,
      type: album.type,
      name: album.name,
      release: new Date(album.release_date),
      tracks: album.total_tracks,
      artists: album.artists.map((artist) => {
        return {
          id: artist.id,
          name: artist.name,
          type: artist.type,
          uri: artist.uri,
        };
      }),
      images: album.images,
      uri: album.uri,
    };
  });
}

function convertTopArtistTracks(data) {
  return data.body.tracks.map((track) => {
    return {
      added_at: null,
      isLocal: track.is_local,
      album: {
        id: track.album.id,
        type: track.album.id,
        name: track.album.name,
        release: new Date(track.album.release_date),
        tracks: track.album.total_tracks,
        artists: track.album.artists.map((artist) => {
          return {
            id: artist.id,
            name: artist.name,
            type: artist.type,
            uri: artist.uri,
          };
        }),
        images: track.album.images,
        uri: track.album.uri,
      },
      artists: track.artists.map((artist) => {
        return {
          id: artist.id,
          name: artist.name,
          type: artist.type,
          uri: artist.uri,
        };
      }),
      duration: track.duration_ms,
      explicit: track.explicit,
      id: track.id,
      name: track.name,
      type: track.type,
      uri: track.uri,
    };
  });
}

function convertRelatedArtists(data) {
  return data.body.artists.map((artist) => {
    return {
      id: artist.id,
      name: artist.name,
      followers: artist.followers.total,
      popularity: artist.popularity,
      genres: artist.genres,
      images: artist.images,
      type: artist.type,
      uri: artist.uri,
    };
  });
}

function convertTest(id, size) {
  const calls = Math.floor(size / 100) + 1;
  const offset = Array(calls)
    .fill(null)
    .map((_, i) => i * 100);
  const requests = offset.map((value) => {
    return spotify
      .getPlaylistTracks(id, { limit: 100, offset: value })
      .then((data) => {
        return data;
      });
  });
  return Promise.all(requests).then((responses) =>
    Promise.all(
      responses.flatMap((r) => {
        return r.body.items.map((item) => {
          return item.track.artists[0].name;
        });
      })
    ).then((data) => {
      return data;
    })
  );
}
