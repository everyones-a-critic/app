import React from 'react';
import { Text, View, StyleSheet, Pressable } from "react-native";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { findIconDefinition } from '@fortawesome/fontawesome-svg-core'
import fontAwesomeLibrary from "../../assets/icons/fontAwesomeLibrary";

import { signOut } from "../features/account/accountSlice";
import SettingsHeader from './SettingsHeader';
import AuthenticationProvider from './AuthenticationProvider';
import { YELLOW, SUPER_LIGHT_GRAY, LIGHT_GRAY } from '../settings/colors';

const SettingsPage = props => {
    return (
        <AuthenticationProvider authExpired={ props.authExpired } navigation={ props.navigation }>
            <View style={{ flex: 1 }}>
                <SettingsHeader navigation={ props.navigation } />
                <View style={ styles.contentContainer }>{ props.children }</View>
            </View>
        </AuthenticationProvider>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 15,
        paddingBottom: 15,
        backgroundColor: SUPER_LIGHT_GRAY,
    }
});

const mapStateToProps = state => {
    return {};
}

export default connect(mapStateToProps, {})(SettingsPage);