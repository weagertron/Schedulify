import React, { useState, useEffect } from 'react';
import { View, TextInput } from 'react-native';
import { Text } from 'react-native-elements';
import RNPickerSelect from 'react-native-picker-select';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Input } from 'react-native-elements';

export default function EditorItem() {

    const [type, setType] = useState('top');
    const [options, setOptions] = useState([
        { label: 'Top Songs', value: 'top' },
        { label: 'Random Songs', value: 'random' },
    ])
    const [trackCount, setTrackCount] = useState('1');

    const handleTrackCountChange = (value) => {
        // remove unwanted characters
        let newValue = value.replace(/[- #*;,.<>\{\}\[\]\\\/]/gi, '')

        // max of 100
        if (newValue !== '' && parseInt(newValue) > 100) newValue = '100';

        // set the new value
        setTrackCount(newValue);
    }

    return (
        <View style={{ width: '90%', marginLeft: '5%', marginRight: '5%' }}>
            <Input
                placeholder='Artist'
                leftIcon={
                    <Icon
                        name='users'
                        size={18}
                        color='silver'
                    />
                }
            />
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