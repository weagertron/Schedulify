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
            webHelper.apiCall('https://api.spotify.com/v1/me', 'GET', {}).then(res => {
                if (res)
                    setUser(res);
            })
        }
    }, [auth])

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
