import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Header, Button, ListItem } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome5';
import LogoutButton from '../components/LogoutButton';
import * as webHelper from '../helpers/helper';
const configs = require('../config/authConfig').default;

export default function Home({ navigation }) {

    const [auth, setAuth] = useState({});
    const [user, setUser] = useState(undefined);
    const [buildRunning, setBuildRunning] = useState(false);

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

    const items = [
        'Test', 'Test', 'Test', 'Test', 'Test', 'Test', 'Test', 'Test', 'Test', 'Test', 'Test', 'Test', 'Test', 'Test', 'Test'
    ]

    const test = () => {

        // How to get random items from array
        // <array>.sort(() => .5 - Math.random()).slice(0, <num to return>))

        // curl -X GET 
        // "https://api.spotify.com/v1/search?q=tania%20bowra&type=artist" 
        // -H "Authorization: Bearer {your access token}"

        setBuildRunning(true);

        let playlistOptions = {
            uid: 'fsdnfkjsdnkj',
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
            setBuildRunning(false);
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
            <>
                <Header
                    leftComponent={<Button title='Sample' onPress={test} loading={buildRunning} />}
                    centerComponent={{ text: `Welcome ${user.display_name}!`, style: { color: '#fff' } }}
                    rightComponent={<LogoutButton navigation={navigation} />}
                />
                <ScrollView>

                    {items.map((i, key) => (
                        <ListItem
                            key={key}
                            onPress={() => navigation.navigate('Editor', { name: 'testName' })}
                            // leftAvatar={{ source: { uri: l.avatar_url } }}
                            title={i}
                            subtitle={'Subtitle'}
                            bottomDivider
                            // badge={{ value: 3, textStyle: { color: 'white' }, badgeStyle: { backgroundColor: 'blue' } }}
                            // chevron
                            rightTitle={
                                <Icon.Button
                                    name='sync'
                                    size={15}
                                    iconStyle={{
                                        marginRight: 0
                                    }}
                                    backgroundColor='gray'
                                />
                            }
                        />
                    ))}
                </ScrollView>
            </>
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
