import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import { authorize, refresh, revoke, prefetchConfiguration } from 'react-native-app-auth';

const configs = {
    identityserver: {
        issuer: 'https://demo.identityserver.io',
        clientId: 'b2a116291fc64d1eb16d1ed2ef4b052a', // available on the app page
        clientSecret: '5d0cfd5ea535457da02c427dd8424ec4', // click "show client secret" to see this
        redirectUrl: 'com.schedulify:/Login', // the redirect you defined after creating the app
        scopes: ['user-read-email', 'playlist-modify-public', 'user-read-private'], // the scopes you need to access
        serviceConfiguration: {
            authorizationEndpoint: 'https://accounts.spotify.com/authorize',
            tokenEndpoint: 'https://accounts.spotify.com/api/token',
        },
    },
    auth0: {
        clientId: 'b2a116291fc64d1eb16d1ed2ef4b052a', // available on the app page
        clientSecret: '5d0cfd5ea535457da02c427dd8424ec4', // click "show client secret" to see this
        redirectUrl: 'com.schedulify:/Login', // the redirect you defined after creating the app
        scopes: ['user-read-email', 'playlist-modify-public', 'user-read-private'], // the scopes you need to access
        serviceConfiguration: {
            authorizationEndpoint: 'https://accounts.spotify.com/authorize',
            tokenEndpoint: 'https://accounts.spotify.com/api/token',
        },
    }
};

const defaultAuthState = {
    hasLoggedInOnce: false,
    provider: '',
    accessToken: '',
    accessTokenExpirationDate: '',
    refreshToken: ''
};

export default function Login(props) {

    const [authState, setAuthState] = useState(defaultAuthState);

    useEffect(() => {
        prefetchConfiguration({
            warmAndPrefetchChrome: true,
            ...configs.identityserver
        });
    }, []);

    const onLogin = async () => {
        //const { email, password } = this.state
        //try {
        //  if (email.length > 0 && password.length > 0) {
        props.navigation.navigate('App');
        //}
        //} catch (error) {
        //    alert(error)
        //}
    }

    const handleAuthorize = useCallback(
        async provider => {
            try {
                const config = configs[provider];
                const newAuthState = await authorize(config);

                setAuthState({
                    hasLoggedInOnce: true,
                    provider: provider,
                    ...newAuthState
                });

                console.log('newAuth: ', {
                    hasLoggedInOnce: true,
                    provider: provider,
                    ...newAuthState
                });

                props.navigation.navigate('Home', {
                    auth: {
                        hasLoggedInOnce: true,
                        provider: provider,
                        ...newAuthState
                    }
                });

            } catch (error) {
                Alert.alert('Failed to log in', error.message);
            }
        },
        [authState]
    );

    return (
        <View style={styles.container}>
            {/* <Text>Login</Text> */}
            <Button
                title='Login with Spotify'
                style={styles.loginButton}
                // onPress={onLogin}
                onPress={() => handleAuthorize('identityserver')}
            />
            {/* <Button
                title='Go to Signup'
                onPress={() => props.navigation.navigate('Signup')}
            /> */}
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