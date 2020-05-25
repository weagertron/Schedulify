import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Header, Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Col, Row, Grid } from "react-native-easy-grid";
import EditorItem from '../components/EditorItem';

export default function Editor({ navigation }) {

    const { name } = navigation.state.params;

    return (
        <>

            <Header
                leftComponent={<Icon.Button
                    name="arrow-left"
                    size={16}
                    onPress={() => navigation.navigate('Home')}
                    iconStyle={{
                        marginRight: 0
                    }}
                    backgroundColor='rgba(52, 52, 52, 0.0)'
                />}
                centerComponent={{ text: `Editor - ${name}`, style: { color: '#fff' } }}
            />

            <Grid>
                <Row size={90}>
                    {/* <Text>Stuff</Text> */}
                    <EditorItem />
                </Row>
                <Row size={10}>
                    <Text>Button</Text>
                </Row>
            </Grid>

        </>
    )
}