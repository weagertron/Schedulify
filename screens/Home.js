import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TouchableHighlight, ActivityIndicator } from 'react-native';
import { Header, Button, ListItem } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome5';
import LogoutButton from '../components/LogoutButton';
import * as webHelper from '../helpers/helper';
import FAB from 'react-native-fab';
import { SwipeListView } from 'react-native-swipe-list-view';
import Modal, { ModalFooter, ModalButton, ModalContent, ModalTitle } from 'react-native-modals';

export default function Home({ navigation }) {

    const [auth, setAuth] = useState({});
    const [user, setUser] = useState(undefined);
    const [buildRunning, setBuildRunning] = useState(false);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(undefined);
    const [showBuildModal, setShowBuildModal] = useState(false);
    const [buildId, setBuildId] = useState(undefined);
    const [buildingPlaylists, setBuildingPlaylists] = useState([]);

    const loadUserData = () => {
        if (auth && Object.keys(auth).length > 0) {
            webHelper.getUserData().then((u) => {
                if (u) {
                    setUser(u);

                    webHelper.getUserPlaylists(u.id).then(playlists => {
                        if (playlists)
                            setUserPlaylists(playlists);
                    })
                }
            })
        }
    }

    useEffect(() => {
        webHelper.getAuth().then(result => {
            setAuth(result);
        })

        const focusListener = navigation.addListener('didFocus', () => {
            // execute function when screen focused
            webHelper.getAuth().then(result => {
                setAuth(result);
                loadUserData();
            })
        });

        return () => focusListener.remove();
    }, [])

    useEffect(() => {
        loadUserData();
    }, [auth])

    const handleBuildPress = (playlistId) => {
        setBuildId(playlistId);
        setShowBuildModal(true);
    }

    const buildPlaylist = () => {

        setShowBuildModal(false);

        console.log('userid: ', user.id);

        let playlistId = buildId;
        let runningPlaylists = [...buildingPlaylists];
        runningPlaylists.push(playlistId);
        setBuildingPlaylists(runningPlaylists);

        webHelper.buildPlaylist(user.id, playlistId).then(res => {

            console.log('Finished making playlist!')

            // remove from running list
            let runningPlaylists = [...buildingPlaylists];
            runningPlaylists.filter(r => r !== playlistId);
            setBuildingPlaylists(runningPlaylists);
            setBuildId(undefined);
        })
    }

    const handleDeletePress = (playlistId) => {
        setDeleteId(playlistId);
        setShowDeleteModal(true);
    }

    const deletePlaylist = () => {
        webHelper.deletePlaylist(user.id, deleteId).then(() => {
            loadUserData();
            setShowDeleteModal(false);
            setDeleteId(undefined);
        })
    }

    const renderPlaylistItem = listItem => {

        let data = listItem.item;
        let totalTrackCount = 0;

        Object.keys(data.items).map(item => {
            totalTrackCount += parseInt(data.items[item].trackCount);
        })

        return (
            <TouchableHighlight
                onPress={() => console.log('You touched me')}
                style={styles.rowFront}
                underlayColor={'#AAA'}
            >
                <View>
                    <ListItem
                        key={data.id}
                        onPress={() => navigation.navigate('Editor', data)}
                        // leftAvatar={{ source: { uri: l.avatar_url } }}
                        title={data.name}
                        subtitle={`${totalTrackCount} tracks`}
                        bottomDivider
                        // badge={{ value: 3, textStyle: { color: 'white' }, badgeStyle: { backgroundColor: 'blue' } }}
                        // chevron
                        rightTitle={() => {
                            if (buildingPlaylists.includes(data.id)) {
                                return (
                                    <ActivityIndicator size="large" color="#0000ff" />
                                )
                            } else {
                                return (
                                    <Icon.Button
                                        name='sync'
                                        size={15}
                                        iconStyle={{
                                            marginRight: 0
                                        }}
                                        backgroundColor='gray'
                                        onPress={() => handleBuildPress(data.id)}
                                    />
                                )
                            }
                        }}
                    />
                </View>
            </TouchableHighlight>
        )
    }

    const renderHiddenItem = (data, rowMap) => (
        <View style={styles.rowBack}>
            <TouchableOpacity
                onPress={() => handleDeletePress(data.item.id)}
            >
                <Icon
                    name='trash-alt'
                    size={18}
                    iconStyle={{
                        marginRight: 0
                    }}
                    style={{ color: 'white', paddingLeft: 10 }}
                />
            </TouchableOpacity>
        </View>
    );

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
            <>
                <Header
                    centerComponent={{ text: `Welcome ${user.display_name}!`, style: { color: '#fff' } }}
                    rightComponent={<LogoutButton navigation={navigation} />}
                />

                <View style={styles.swipeListContainer}>
                    <SwipeListView
                        data={userPlaylists}
                        renderItem={renderPlaylistItem}
                        renderHiddenItem={renderHiddenItem}
                        leftOpenValue={75}
                        rightOpenValue={-150}
                        previewRowKey={'0'}
                        previewOpenValue={-40}
                        previewOpenDelay={3000}
                        disableLeftSwipe={true}
                    />
                </View>

                <FAB
                    buttonColor="#3a42b5"
                    iconTextColor="#FFFFFF"
                    onClickAction={() => { navigation.navigate('Editor', undefined) }}
                    visible={true}
                />

                <Modal
                    visible={showDeleteModal}
                    onTouchOutside={() => { setShowDeleteModal(false); setDeleteId(undefined); }}
                    title={<ModalTitle title='Delete Playlist?' />}
                    footer={
                        <ModalFooter>
                            <ModalButton
                                text="No"
                                onPress={() => { setShowDeleteModal(false); setDeleteId(undefined); }}
                            />
                            <ModalButton
                                text="Yes"
                                onPress={deletePlaylist}
                            />
                        </ModalFooter>
                    }
                >
                    <ModalContent>
                        <Text>Are you sure you want to delete this paylist?</Text>
                    </ModalContent>
                </Modal>

                <Modal
                    visible={showBuildModal}
                    onTouchOutside={() => { setShowBuildModal(false); setBuildId(undefined); }}
                    title={<ModalTitle title='Generate Playlist?' />}
                    footer={
                        <ModalFooter>
                            <ModalButton
                                text="No"
                                onPress={() => { setShowBuildModal(false); setBuildId(undefined); }}
                            />
                            <ModalButton
                                text="Yes"
                                onPress={buildPlaylist}
                            />
                        </ModalFooter>
                    }
                >
                    <ModalContent>
                        <Text>Are you sure you want to generate this paylist?</Text>
                    </ModalContent>
                </Modal>
            </>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center'
    },
    swipeListContainer: {
        // backgroundColor: 'white',
        flex: 1,
    },
    backTextWhite: {
        color: '#FFF',
    },
    rowFront: {
        // alignItems: 'center',
        // backgroundColor: '#CCC',
        // borderBottomColor: 'black',
        // borderBottomWidth: 1,
        // justifyContent: 'center',
        // height: 50,
    },
    rowBack: {
        alignItems: 'center',
        // backgroundColor: '#DDD',
        backgroundColor: 'red',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 15,
        color: 'white'
    },
    // backRightBtn: {
    //     alignItems: 'center',
    //     bottom: 0,
    //     justifyContent: 'center',
    //     position: 'absolute',
    //     top: 0,
    //     width: 75,
    // },
    // backRightBtnLeft: {
    //     backgroundColor: 'blue',
    //     right: 75,
    // },
    // backRightBtnRight: {
    //     backgroundColor: 'red',
    //     right: 0,
    // },
});
