auth = {
    identityserver: {
        issuer: 'https://demo.identityserver.io',
        clientId: 'b2a116291fc64d1eb16d1ed2ef4b052a', // available on the app page
        clientSecret: '5d0cfd5ea535457da02c427dd8424ec4', // click "show client secret" to see this
        redirectUrl: 'com.schedulify:/Login', // the redirect you defined after creating the app
        scopes: ['user-read-email', 'playlist-modify-public', 'playlist-modify-private', 'playlist-read-private', 'user-read-private'], // the scopes you need to access
        serviceConfiguration: {
            authorizationEndpoint: 'https://accounts.spotify.com/authorize',
            tokenEndpoint: 'https://accounts.spotify.com/api/token',
        },
    },
    auth0: {
        clientId: 'b2a116291fc64d1eb16d1ed2ef4b052a', // available on the app page
        clientSecret: '5d0cfd5ea535457da02c427dd8424ec4', // click "show client secret" to see this
        redirectUrl: 'com.schedulify:/Login', // the redirect you defined after creating the app
        scopes: ['user-read-email', 'playlist-modify-public', 'playlist-modify-private', 'playlist-read-private', 'user-read-private'], // the scopes you need to access
        serviceConfiguration: {
            authorizationEndpoint: 'https://accounts.spotify.com/authorize',
            tokenEndpoint: 'https://accounts.spotify.com/api/token',
        },
    }
}

export default {
    auth
}