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

        let playlistOptions = {
            name: 'MyNewPlaylist',
            public: false,
            params: [
                {
                    artist: 'Foo Fighters',
                    type: 'random',
                    amount: 5,
                    options: {
                        excludeLive: true // not sure how to do this...
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
            ]
        }

        webHelper.buildPlaylist(playlistOptions).then(res => {
            console.log('Finished making playlist!')
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
