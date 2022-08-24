import React from 'react';
import { View, Text } from 'react-native';

const ConfirmAccount = ({navigation, route}) => {
    // route.params.email;
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text>A confirmation code was sent to the email address you provided. Enter this code below to confirm your account.</Text>
        </View>
    );
};

export default ConfirmAccount;