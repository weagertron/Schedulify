import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Header, Button, CheckBox } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome5';
import EditorItem from '../components/EditorItem';
import FAB from 'react-native-fab';
import UUIDGenerator from 'react-native-uuid-generator';
import { Input } from 'react-native-elements';
import EncryptedStorage from 'react-native-encrypted-storage';
import * as webHelper from '../helpers/helper';

export default function Editor({ navigation }) {

    const [name, setName] = useState(undefined);
    const [playlistId, setPlaylistId] = useState(undefined);
    const [playlistItems, setPlaylistItems] = useState({});
    const [playlistOptions, setPlaylistOptions] = useState({
        public: false
    })

    useEffect(() => {
        if (navigation.state.params) {
            let params = navigation.state.params;

            // editing a playlist
            setName(params.name);
            setPlaylistItems(params.items);
            setPlaylistId(params.id);
            setPlaylistOptions(params.options);
        } else {
            // new playlist
            UUIDGenerator.getRandomUUID(uid => {
                setPlaylistId(uid);
                setName('New Playlist');
                setPlaylistItems({});
                setPlaylistOptions({
                    public: false
                })
            })
        }
    }, [])

    const setOption = (option, value) => {
        let newOptions = { ...playlistOptions };
        newOptions[option] = value;
        setPlaylistOptions(newOptions);
    }

    const setItem = (id, data) => {
        let temp = { ...playlistItems };
        temp[id] = data;
        setPlaylistItems(temp);
    }

    const addItem = () => {
        UUIDGenerator.getRandomUUID(uid => {
            let temp = { ...playlistItems };
            temp[uid] = {
                artist: '',
                trackCount: '1',
                type: 'top'
            }

            setPlaylistItems(temp);
        })
    }

    const removeItem = (id) => {
        let temp = { ...playlistItems };
        delete temp[id];
        setPlaylistItems(temp);
    }

    const handleSave = () => {
        webHelper.getUserData().then((u) => {
            if (u) {
                EncryptedStorage.getItem(`userData.${u.id}.playlists`).then(playlists => {

                    let userPlaylists = JSON.parse(playlists);
                    let existingPlaylist = userPlaylists.find(p => p.id === playlistId);

                    if (existingPlaylist) {
                        // editing a playlist
                        let newPlaylists = Array.from(userPlaylists);
                        newPlaylists = newPlaylists.filter(p => p.id !== existingPlaylist.id);

                        newPlaylists.push({
                            id: existingPlaylist.id,
                            name: name,
                            items: playlistItems,
                            options: playlistOptions
                        });

                        EncryptedStorage.setItem(`userData.${u.id}.playlists`, JSON.stringify(newPlaylists)).then(() => {
                            console.log('Saved!');
                            navigation.navigate('Home');
                        });

                    } else {
                        // creating a new playlist
                        let newPlaylists = Array.from(userPlaylists);
                        newPlaylists.push({
                            id: playlistId,
                            name: name,
                            items: playlistItems,
                            options: playlistOptions
                        })

                        EncryptedStorage.setItem(`userData.${u.id}.playlists`, JSON.stringify(newPlaylists)).then(() => {
                            console.log('Saved!');
                            navigation.navigate('Home');
                        })
                    }
                });
            }
        })
    }

    // const { name } = navigation.state.params;
    // let test = [
    //     {
    //         artist: 'Foo Fighters',
    //         trackCount: '1',
    //         type: 'random'
    //     },
    //     {
    //         artist: 'Tellison',
    //         trackCount: '4',
    //         type: 'top'
    //     },
    //     {
    //         artist: 'Muse',
    //         trackCount: '7',
    //         type: 'random'
    //     },
    // ]

    return (
        <>
            <Header
                leftComponent={
                    <Icon.Button
                        name="arrow-left"
                        size={16}
                        onPress={() => navigation.navigate('Home')}
                        iconStyle={{
                            marginRight: 0
                        }}
                        backgroundColor='rgba(52, 52, 52, 0.0)'
                    />
                }
                centerComponent={{ text: name, style: { color: '#fff' } }}
                rightComponent={
                    <Icon.Button
                        name="save"
                        size={16}
                        onPress={handleSave}
                        iconStyle={{
                            marginRight: 0
                        }}
                        backgroundColor='rgba(52, 52, 52, 0.0)'
                    />
                }
            />

            <View style={{ flexDirection: 'row' }}>
                <View style={{ width: '70%' }}>
                    <Input
                        value={name}
                        onChangeText={value => setName(value)}
                        placeholder='Playlist Name'
                        style={styles.nameInput}
                        label='Spotify Playlist Name'
                    // leftIcon={
                    //     <Icon
                    //         name='users'
                    //         size={18}
                    //         color='silver'
                    //     />
                    // }
                    />
                </View>
                <View style={{ width: '30%' }}>
                    <CheckBox
                        title='Public'
                        containerStyle={{ backgroundColor: 'rgba(52, 52, 52, 0.0)', borderWidth: 0 }}
                        checked={playlistOptions.public}
                        onPress={(e) => setOption('public', !playlistOptions.public)}
                    />
                </View>
            </View>

            <ScrollView>
                {Object.keys(playlistItems).map((playlistId) => {
                    return (
                        <EditorItem
                            key={playlistId}
                            data={playlistItems[playlistId]}
                            setItem={(data) => setItem(playlistId, data)}
                            removeItem={() => removeItem(playlistId)}
                        />
                    )
                })}
            </ScrollView>

            <FAB
                buttonColor="#3a42b5"
                iconTextColor="#FFFFFF"
                onClickAction={addItem}
                visible={true}
            // iconTextComponent={<Icon name="all-out" />}
            />

        </>
    )
}

const styles = StyleSheet.create({
    nameInput: {
        textAlign: 'center'
    }
});