import React from 'react';
import { revoke } from 'react-native-app-auth';
import EncryptedStorage from 'react-native-encrypted-storage';
const configs = require('../config/authConfig').default;

const getAuth = async (navigation) => {
    return await new Promise((resolve) => {
        try {
            EncryptedStorage.getItem("userSession").then(auth => {
                if (auth)
                    resolve(JSON.parse(auth));
                else
                    resolve(undefined);
            });

        } catch (error) {
            console.error('Error retrieving auth: ', error);
            resolve(undefined);
        }
    })
}

const revokeToken = async () => {
    return await new Promise((resolve) => {
        try {
            const config = configs.auth.identityserver;

            getAuth().then((auth) => {
                revoke(config, {
                    tokenToRevoke: auth.accessToken,
                    sendClientId: true
                }).then(() => {
                    try {
                        EncryptedStorage.removeItem('userSession').then(() => {
                            resolve(true);
                        })
                    } catch (error) {
                        console.log('Error removing "userSession": ', error);
                        resolve(false);
                    }
                })
            })

        } catch (error) {
            console.error('Failed to revoke token', error.message);
            resolve(false);
        }
    })
};

async function apiCall(uri, type, body) {
    return await new Promise((resolve) => {
        getAuth().then(auth => {
            let fetchParams = {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.accessToken}`
                }
            }

            if (type !== 'GET' && Object.keys(body).length > 0)
                fetchParams = { ...fetchParams, body: body };

            fetch(uri, fetchParams)
                .then((response) => response.json())
                .then((responseJson) => {
                    resolve(responseJson);
                })
                .catch((error) => {
                    console.error(error);
                    resolve(undefined);
                });
        })
    })
}

export {
    apiCall,
    revokeToken,
    getAuth
}