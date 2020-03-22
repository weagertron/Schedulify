import React from 'react';
import { Button } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import { revoke } from 'react-native-app-auth';
const configs = require('../config/authConfig').default;

export default function LogoutButton({ token, navigation }) {

    const handleRevoke = async () => {
        try {
            const config = configs.auth.identityserver;
            await revoke(config, {
                tokenToRevoke: token,
                sendClientId: true
            });

            try {
                await EncryptedStorage.removeItem('userSession');
            } catch (error) {
                console.log('Error removing "userSession": ', error);
            }

        } catch (error) {
            Alert.alert('Failed to revoke token', error.message);
        }
    };

    const handleLogout = async () => {
        await handleRevoke();
        navigation.navigate('Login');
    }

    return (
        <Button
            title='Logout'
            onPress={handleLogout}
        />
    )
}