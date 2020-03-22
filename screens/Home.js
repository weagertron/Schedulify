import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import LogoutButton from '../components/LogoutButton';
const webHelper = require('../helpers/apiCall').default;
const configs = require('../config/authConfig').default;

export default function Home({ route, navigation }) {

    const [auth, setAuth] = useState({});
    const [user, setUser] = useState(undefined);

    useEffect(() => {
        retrieveAuth();
    }, [])

    useEffect(() => {

        if (auth && Object.keys(auth).length > 0) {
            webHelper.apiCall('https://api.spotify.com/v1/me', 'GET', auth.accessToken, {}, (res) => {
                setUser(res);
            });
        }
    }, [auth])

    const retrieveAuth = async () => {
        try {

            const authObject = await EncryptedStorage.getItem("userSession");

            if (authObject !== undefined) {
                setAuth(JSON.parse(authObject));
            }
        } catch (error) {
            console.log('Error retrieving "userSession: "', error);
        }
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
                        <LogoutButton token={auth.accessToken} navigation={navigation} />
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
