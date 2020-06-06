import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Input } from 'react-native-elements';
import _ from 'lodash';

export default function EditorItem({ data, setItem, removeItem }) {

    const [options, setOptions] = useState([
        { label: 'Top Songs', value: 'top' },
        { label: 'Random Songs', value: 'random' },
    ])

    const [artist, setArtist] = useState(data ? data.artist : '');
    const [trackCount, setTrackCount] = useState(data ? data.trackCount : '1');
    const [type, setType] = useState(data ? data.type : 'top');

    const handleTrackCountChange = (value) => {
        // remove unwanted characters
        let newValue = value.replace(/[- #*;,.<>\{\}\[\]\\\/]/gi, '')

        // max of 100
        if (newValue !== '' && parseInt(newValue) > 100) newValue = '100';

        // set the new value
        setTrackCount(newValue);
    }

    useEffect(() => {
        setItem({
            artist,
            trackCount,
            type
        })

    }, [artist, trackCount, type])

    useEffect(() => {
        setArtist(data.artist);
        setTrackCount(data.trackCount);
        setType(data.type);
    }, [])

    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row' }}>
                <View style={{ width: '80%' }}>
                    <Input
                        value={artist}
                        onChangeText={value => setArtist(value)}
                        placeholder='Artist'
                        leftIcon={
                            <Icon
                                name='users'
                                size={18}
                                color='silver'
                            />
                        }
                    />
                </View>
                <View style={{ width: '20%', alignItems: 'center', paddingTop: 8 }}>
                    <Icon.Button
                        name="trash-alt"
                        size={20}
                        onPress={() => removeItem(data.id)}
                        iconStyle={{
                            marginRight: 0,
                        }}
                        backgroundColor='rgba(52, 52, 52, 0.0)'
                        color="red"
                    />
                </View>
            </View>
            <View style={{ flexDirection: 'row' }}>
                <View style={{ width: '50%' }}>
                    <Input
                        autoCompleteType='off'
                        keyboardType='number-pad'
                        value={trackCount}
                        onChangeText={handleTrackCountChange}
                    />
                </View>
                <View style={{ width: '50%' }}>
                    <RNPickerSelect
                        onValueChange={(value) => setType(value)}
                        placeholder={{}}
                        value={type}
                        items={options}
                    />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '90%',
        marginLeft: '5%',
        marginRight: '5%',
        borderColor: 'silver',
        borderStyle: 'solid',
        borderWidth: 1,
        borderRadius: 10,
        marginTop: 10
    }
});