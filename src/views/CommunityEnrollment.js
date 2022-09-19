import "react-native-get-random-values";
import { setupURLPolyfill } from 'react-native-url-polyfill';
setupURLPolyfill();

import React from 'react';
import { View, Text } from 'react-native';
import { connect } from "react-redux";


const CommunityEnrollment = props => {
    return (
        <View style={{flex: 1, height: "100%", alignItems: "center", justifyContent: "center" }}>
            <Text style={{fontSize: 40}}>Communities</Text>
            <Text style={{fontSize: 18}}>{props.identityToken}</Text>
        </View>
    )
}

const mapStateToProps = state => {
    return {
        identityToken: state.account.identityToken
    }
}

export default connect(mapStateToProps, {})(CommunityEnrollment);