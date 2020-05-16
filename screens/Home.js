import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import LogoutButton from '../components/LogoutButton';
import * as webHelper from '../helpers/helper';
const configs = require('../config/authConfig').default;

export default function Home({ route, navigation }) {

    const [auth, setAuth] = useState({});
    const [user, setUser] = useState(undefined);

    useEffect(() => {
        webHelper.getAuth().then(result => {
            setAuth(result);
        })
    }, [])

    useEffect(() => {
        if (auth && Object.keys(auth).length > 0) {
            webHelper.apiCall('me', 'GET', {}).then(res => {
                if (res)
                    setUser(res);
            })
        }
    }, [auth])

    const test = () => {

        // How to get random items from array
        // <array>.sort(() => .5 - Math.random()).slice(0, <num to return>))

        // curl -X GET 
        // "https://api.spotify.com/v1/search?q=tania%20bowra&type=artist" 
        // -H "Authorization: Bearer {your access token}"

        // sample of rules to follow
        let params = [
            {
                artist: 'Foo Fighters',
                type: 'random',
                amount: 5,
                options: {
                    excludeLive: true
                    // includeSingles?
                }
            },
            {
                artist: 'red hot chili peppers',
                type: 'top',
                amount: 6,
                options: {
                    excludeLive: true
                }
            },
            {
                artist: 'muse',
                type: 'random',
                amount: 3,
                options: {
                    excludeLive: true
                }
            }
        ];

        let paramPromises = [];
        let allTracks = [];

        // loop through all the rules
        params.map(param => {

            console.log('params: ', params);

            // create a new promise per rule
            paramPromises.push(new Promise(paramResolve => {

                // determine what api calls to perform based on the option
                if (param.type === 'random') {

                    // get the artist
                    webHelper.apiCall(
                        `search?q=${param.artist.replace(' ', '%20')}&type=artist`,
                        'GET',
                        {}
                    ).then(res => {

                        let { id, name } = res.artists.items[0];

                        // get all albums
                        webHelper.apiCall(`artists/${id}/albums?include_groups=album&country=from_token`, 'GET', {}).then(albums => {

                            // store album ids in an array
                            let albumArray = albums.items.map(album => album.id);

                            // create promises for the api calls for each album
                            let trackPromises = [];

                            // array to store all the ids for artist's tracks
                            let allArtistTracks = [];

                            // populate "allArtistTracks" with the IDs
                            albumArray.map(albumId => {
                                trackPromises.push(new Promise(tracksResolve => {
                                    webHelper.apiCall(`albums/${albumId}/tracks`, 'GET', {}).then(tracks => {

                                        tracks.items.map(track => {
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
                    webHelper.apiCall(`search?q=${param.artist.replace(' ', '%20')}&type=artist`, 'GET', {}).then(res => {

                        let { id, name } = res.artists.items[0];

                        // get the artist's top tracks
                        webHelper.apiCall(`artists/${id}/top-tracks?country=from_token`, 'GET', {}).then(tracks => {

                            // add the desired amount of tracks to the "allTracks" array
                            tracks.tracks.slice(0, param.amount).map(t => {
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

            // output the tracks we have retrieved
            webHelper.apiCall(`tracks?ids=${allTracks.join(',')}`, 'GET', {}).then(tracks => {

                console.log('');
                console.log('all tracks count: ', allTracks.length);
                console.log('');
                console.log('tracks: ', tracks.tracks.map(t => t.name));
                console.log('');

            })
        })
    }

    if (!user) {
        return (
            <View style={styles.container}>
                {user &&
                    <Text>Loading...</Text>
                }
            </View>
        )
    } else {
        return (
            <View style={styles.container}>
                {user &&
                    <>
                        <Text>Welcome {user.display_name}!</Text>
                        <LogoutButton navigation={navigation} />
                        <Button title={'Sample'} onPress={test} />
                    </>
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center'
    }
});
