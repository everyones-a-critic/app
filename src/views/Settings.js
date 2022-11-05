import React from 'react';
import { Text, View, StyleSheet, Pressable } from "react-native";

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { findIconDefinition } from '@fortawesome/fontawesome-svg-core'
import fontAwesomeLibrary from "../../assets/icons/fontAwesomeLibrary";

import Header from '../components/Header';
import SettingsRow from '../components/SettingsRow';
import { YELLOW, SUPER_LIGHT_GRAY, LIGHT_GRAY } from '../settings/colors';

const Settings = props => {
    const logout = () => {

    }

    const deleteAccount = () => {

    }

    return (
        <View style={{ flex: 1 }}>
            <Header
                primaryColor={ YELLOW }
                secondaryColor={ 'black' }
                backButtonEnabled={ true }
                navigation={ props.navigation }
                title={ 'Settings' } />
            <View style={ styles.contentContainer }>
                <Text style={ styles.sectionHeader }>Account</Text>
                <SettingsRow
                    title={ 'Logout' }
                    icon={ 'right-from-bracket' }
                    onPress={ () => logout() }
                />
                <SettingsRow
                    title={ 'Delete Account' }
                    icon={ 'user-slash' }
                    onPress={ () => deleteAccount() }
                />
            </View>
        </View>
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
    },
    sectionHeader: {
        marginBottom: 10,
        fontWeight: '500',
        fontSize: 22,
        fontFamily: 'Helvetica Neue',
    }
});

export default Settings;