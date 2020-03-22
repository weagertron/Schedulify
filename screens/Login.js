import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import { authorize, refresh, revoke, prefetchConfiguration } from 'react-native-app-auth';
import EncryptedStorage from 'react-native-encrypted-storage';
const authConfig = require('../config/authConfig').default;

const configs = authConfig.auth;

const defaultAuthState = {
    hasLoggedInOnce: false,
    provider: '',
    accessToken: '',
    accessTokenExpirationDate: '',
    refreshToken: ''
};

export default function Login(props) {

    const [authState, setAuthState] = useState(defaultAuthState);

    const storeUserSession = async (auth) => {
        try {
            await EncryptedStorage.setItem('userSession', JSON.stringify(auth));
        } catch (error) {
            console.log('Error setting "userSession: "', error);
        }
    }

    useEffect(() => {
        prefetchConfiguration({
            warmAndPrefetchChrome: true,
            ...configs.identityserver
        });

        awaitAuth = async () => {
            try {

                const authObject = await EncryptedStorage.getItem("userSession");

                if (authObject !== undefined) {
                    props.navigation.navigate('Home');
                }

            } catch (error) {
                console.log(error);
            }
        }

        awaitAuth();

    }, []);

    const handleAuthorize = useCallback(
        async provider => {
            try {
                const config = configs[provider];
                const authItems = await authorize(config);

                const newAuthState = {
                    hasLoggedInOnce: true,
                    provider: provider,
                    ...authItems
                }

                setAuthState(newAuthState);
                await storeUserSession(newAuthState);

                props.navigation.navigate('Home');

            } catch (error) {
                Alert.alert('Failed to log in', error.message);
            }
        },
        [authState]
    );

    return (
        <View style={styles.container}>
            <Button
                title='Login with Spotify'
                style={styles.loginButton}
                onPress={() => handleAuthorize('identityserver')}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center'
    },
    loginButton: {
        backgroundColor: '#1dbf48'
    }
})