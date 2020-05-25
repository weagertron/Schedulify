import React from 'react';
import { revoke, refresh } from 'react-native-app-auth';
import EncryptedStorage from 'react-native-encrypted-storage';
const configs = require('../config/authConfig').default;

const getAuth = async (navigation) => {
    return await new Promise((resolve) => {
        try {
            EncryptedStorage.getItem("userSession").then(auth => {
                if (auth) {

                    let parsedAuth = JSON.parse(auth);

                    // check accessTokenExpirationDate field
                    let currentExpiry = Date.parse(parsedAuth.accessTokenExpirationDate);

                    // if expired, call a refresh 
                    if (currentExpiry < Date.now()) {

                        console.log('Token has expired!');

                        // grab the new accessToken and accessTokenExpirationDate
                        refresh(configs.auth.identityserver, { refreshToken: parsedAuth.refreshToken }).then(newAuth => {

                            if (newAuth) {

                                let authToSet = {
                                    ...parsedAuth,
                                    accessToken: newAuth.accessToken,
                                    accessTokenExpirationDate: newAuth.accessTokenExpirationDate
                                }

                                console.log('New Auth Object: ', authToSet);

                                EncryptedStorage.setItem('userSession', JSON.stringify(authToSet)).then(() => {
                                    resolve(authToSet);
                                })

                            } else {
                                resolve(undefined);
                            }
                        })
                    } else {
                        // the access token is still valid so return it
                        resolve(parsedAuth);
                    }
                } else {
                    resolve(undefined);
                }
            });

        } catch (error) {
            console.error('Error retrieving auth: ', error);
            resolve(undefined);
        }
    })
}

const revokeToken = async () => {
    return await new Promise((resolve) => {
        try {
            const config = configs.auth.identityserver;

            getAuth().then((auth) => {
                revoke(config, {
                    tokenToRevoke: auth.accessToken,
                    sendClientId: true
                }).then(() => {
                    try {
                        EncryptedStorage.removeItem('userSession').then(() => {
                            resolve(true);
                        })
                    } catch (error) {
                        console.log('Error removing "userSession": ', error);
                        resolve(false);
                    }
                })
            })

        } catch (error) {
            console.error('Failed to revoke token', error.message);
            resolve(false);
        }
    })
};

async function apiCall(uri, type, body) {
    return await new Promise((resolve) => {
        getAuth().then(auth => {
            let fetchParams = {
                method: type,
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.accessToken}`
                }
            }

            if (type !== 'GET' && Object.keys(body).length > 0)
                fetchParams = { ...fetchParams, body: JSON.stringify(body) };

            fetch(`https://api.spotify.com/v1/${uri}`, fetchParams)
                .then((response) => response.json())
                .then((responseJson) => {
                    resolve(responseJson);
                })
                .catch((error) => {
                    console.error(error);
                    resolve(undefined);
                });
        })
    })
}

async function getArtist(artistName) {
    return await new Promise(resolve => {
        apiCall(
            `search?q=${artistName.replace(' ', '%20')}&type=artist`,
            'GET',
            {}
        ).then(res => {
            resolve(res.artists.items[0]);
        })
    })
}

async function getArtistsAlbums(artistId) {
    return await new Promise(resolve => {
        apiCall(
            `artists/${artistId}/albums?include_groups=album&country=from_token`,
            'GET',
            {}
        ).then(res => {
            resolve(res.items);
        })
    })
}

async function getArtistsTopTracks(artistId) {
    return await new Promise(resolve => {
        apiCall(
            `artists/${artistId}/top-tracks?country=from_token`,
            'GET',
            {}
        ).then(res => {
            resolve(res.tracks);
        })
    })
}

async function getAlbumTracks(albumId) {
    return await new Promise(resolve => {
        apiCall(
            `albums/${albumId}/tracks`,
            'GET',
            {}
        ).then(res => {
            resolve(res.items);
        })
    })
}

async function buildPlaylist(options) {
    return await new Promise(mainResolve => {

        let paramPromises = [];
        let allTracks = [];
        let expectedTracks = 0;

        options.params.map(p => expectedTracks += p.amount);

        console.log('');
        console.log(`Expecting ${expectedTracks}`);
        console.log('');
        console.log('Building...');
        console.log('');

        // loop through all the rules
        options.params.map(param => {

            // create a new promise per rule
            paramPromises.push(new Promise(paramResolve => {

                // determine what api calls to perform based on the option
                if (param.type === 'random') {

                    // get the artist
                    getArtist(param.artist).then(artist => {

                        let { id, name } = artist;

                        // get all albums
                        getArtistsAlbums(id).then(albums => {

                            // store album ids in an array
                            let albumArray = albums.map(album => album.id);

                            // create promises for the api calls for each album
                            let trackPromises = [];

                            // array to store all the ids for artist's tracks
                            let allArtistTracks = [];

                            // populate "allArtistTracks" with the IDs
                            albumArray.map(albumId => {
                                trackPromises.push(new Promise(tracksResolve => {
                                    getAlbumTracks(albumId).then(tracks => {

                                        tracks.map(track => {
                                            allArtistTracks.push(track.uri);
                                        })

                                        tracksResolve();
                                    })
                                }))
                            })

                            Promise.all(trackPromises).then(() => {

                                // select a random amount of tracks from the array into the "allTracks" array
                                allArtistTracks.sort(() => .5 - Math.random()).slice(0, param.amount).map(trackId => {
                                    allTracks.push(trackId);
                                })

                                paramResolve();
                            })
                        })
                    })
                } else {

                    // search for the artist
                    getArtist(param.artist).then(artist => {

                        let { id, name } = artist;

                        // get the artist's top tracks
                        getArtistsTopTracks(id).then(tracks => {

                            // add the desired amount of tracks to the "allTracks" array
                            tracks.slice(0, param.amount).map(t => {
                                allTracks.push(t.uri);
                            })

                            paramResolve();
                        })
                    })
                }
            }))
        })

        // once all params have been processed we have a full array of the track IDs
        Promise.all(paramPromises).then(() => {

            console.log('Actual track count: ', allTracks.length);
            console.log('');

            // here would be where we would actually create the playlist
            apiCall('me/playlists', 'GET', {}).then(playlists => {

                let existingPlaylist = playlists.items.find(p => p.name === options.name);

                // see if the playlist already exists
                if (existingPlaylist) {
                    // playlist exists so we replace the tracks
                    apiCall(`playlists/${existingPlaylist.id}/tracks`, 'PUT', { uris: [] }).then(() => {
                        apiCall(`playlists/${existingPlaylist.id}/tracks`, 'POST', { uris: allTracks }).then(() => {
                            console.log(`Tracks replaced in "${existingPlaylist.name}" playlist.`);
                            console.log('');
                            mainResolve();
                        })
                    })
                } else {
                    // playlist doesn't exist so create it and insert the tracks
                    apiCall('me', 'GET', {}).then(user => {
                        apiCall(`users/${user.id}/playlists`, 'POST', { name: options.name, public: options.public }).then(newPlaylist => {
                            apiCall(`playlists/${newPlaylist.id}/tracks`, 'POST', { uris: allTracks }).then(() => {
                                console.log(`"${newPlaylist.name}" playlist created and tracks inserted`);
                                console.log('');
                                mainResolve();
                            })
                        })
                    })
                }
            })
        })
    })
}

export {
    apiCall,
    revokeToken,
    getAuth,
    getArtist,
    getArtistsAlbums,
    getArtistsTopTracks,
    getAlbumTracks,
    buildPlaylist
}