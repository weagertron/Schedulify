apiCall = (uri, type, token, body, cb) => {

    let fetchParams = {
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    }

    if (type !== 'GET' && Object.keys(body).length > 0)
        fetchParams = { ...fetchParams, body: body };

    fetch(uri, fetchParams)
        .then((response) => response.json())
        .then((responseJson) => {
            console.log('responsejson: ', responseJson);
            cb(responseJson);
        })
        .catch((error) => {
            console.error(error);
            cb(undefined);
        });
}

export default {
    apiCall
}