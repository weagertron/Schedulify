import React, { useState } from 'react';
import { Text } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome5';
import * as webHelper from '../helpers/helper';
import Modal, { ModalFooter, ModalButton, ModalContent, ModalTitle } from 'react-native-modals';
const configs = require('../config/authConfig').default;

export default function LogoutButton({ navigation }) {

    const [showModal, setShowModal] = useState(false);

    const showLogoutConfirm = () => {
        setShowModal(true);
    }

    const handleLogout = async () => {
        setShowModal(false);
        await webHelper.revokeToken().then(success => {
            if (success)
                navigation.navigate('Login');
        });
    }

    return (
        <>
            <Icon.Button
                name="sign-out-alt"
                size={16}
                onPress={showLogoutConfirm}
                iconStyle={{
                    marginRight: 0
                }}
                backgroundColor='rgba(52, 52, 52, 0.0)'
            />

            <Modal
                visible={showModal}
                onTouchOutside={() => setShowModal(false)}
                title={<ModalTitle title='Logout?' />}
                footer={
                    <ModalFooter>
                        <ModalButton
                            text="No"
                            onPress={() => { setShowModal(false) }}
                        />
                        <ModalButton
                            text="Yes"
                            onPress={handleLogout}
                        />
                    </ModalFooter>
                }
            >
                <ModalContent>
                    <Text>Are you sure you want to logout?</Text>
                </ModalContent>
            </Modal>
        </>
    )
}