import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
const webHelper = require('../helpers/apiCall').default;

export default function Home({ route, navigation }) {

    const [auth, setAuth] = useState(navigation.state.params.auth);
    const [user, setUser] = useState(undefined);

    useEffect(() => {
        webHelper.apiCall('https://api.spotify.com/v1/me', 'GET', auth.accessToken, {}, (res) => {
            setUser(res);
        });
    }, [])

    return (
        <View style={styles.container}>
            {user &&
                <Text>Welcome {user.display_name}!</Text>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center'
    }
});
