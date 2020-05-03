import React from 'react';
import { Button } from 'react-native';
import * as webHelper from '../helpers/helper';
const configs = require('../config/authConfig').default;

export default function LogoutButton({ navigation }) {
    const handleLogout = async () => {
        await webHelper.revokeToken().then(success => {
            if (success)
                navigation.navigate('Login');
        });
    }

    return (
        <Button
            title='Logout'
            onPress={handleLogout}
        />
    )
}