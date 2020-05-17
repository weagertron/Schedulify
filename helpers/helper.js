import React from 'react';
import { revoke } from 'react-native-app-auth';
import EncryptedStorage from 'react-native-encrypted-storage';
const configs = require('../config/authConfig').default;

const getAuth = async (navigation) => {
    return await new Promise((resolve) => {
        try {
            EncryptedStorage.getItem("userSession").then(auth => {
                if (auth)
                    resolve(JSON.parse(auth));
                else
                    resolve(undefined);
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
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.accessToken}`
                }
            }

            if (type !== 'GET' && Object.keys(body).length > 0)
                fetchParams = { ...fetchParams, body: body };

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

async function buildPlaylist(params) {
    return await new Promise(mainResolve => {

        let paramPromises = [];
        let allTracks = [];

        console.log('params: ', params);

        let expectedTracks = 0;

        params.map(p => expectedTracks += p.amount);

        console.log('');
        console.log(`Expecting ${expectedTracks}`);
        console.log('');
        console.log('Building...');
        console.log('');

        // loop through all the rules
        params.map(param => {

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
                                            allArtistTracks.push(track.id);
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
                                allTracks.push(t.id);
                            })

                            paramResolve();
                        })
                    })
                }
            }))
        })

        // once all params have been processed we have a full array of the track IDs
        Promise.all(paramPromises).then(() => {

            // here would be where we would actually create the playlist

            // output the tracks we have retrieved
            apiCall(`tracks?ids=${allTracks.join(',')}`, 'GET', {}).then(tracks => {

                console.log('');
                console.log('Returned tracks count: ', allTracks.length);
                console.log('');
                console.log('Returned tracks: ', tracks.tracks.map(t => t.name));
                console.log('');

                mainResolve(allTracks);
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