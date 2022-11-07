import React from 'react';
import { Text, View, StyleSheet, Pressable } from "react-native";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { findIconDefinition } from '@fortawesome/fontawesome-svg-core'
import fontAwesomeLibrary from "../../assets/icons/fontAwesomeLibrary";

import { signOut } from "../features/account/accountSlice";
import { reset as resetCommunities } from "../features/communities/communitiesSlice";
import { reset as resetProducts } from "../features/products/productsSlice";
import { reset as resetRatings } from "../features/ratings/ratingsSlice";

import SettingsPage from '../components/SettingsPage';
import SettingsRow from '../components/SettingsRow';

import { YELLOW, SUPER_LIGHT_GRAY, LIGHT_GRAY } from '../settings/colors';

const Settings = props => {
    const logout = async () => {
        await props.signOut();
        props.resetCommunities();
        props.resetProducts();
        props.resetRatings();
        props.navigation.navigate('Sign In', { customMessage: "You've been successfully logged out."})
    }

    const deleteAccount = () => {
        props.navigation.navigate('Delete Account')
    }

    return (
        <SettingsPage authExpired={ props.authExpired } navigation={ props.navigation }>
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
        </SettingsPage>
    );
}

const styles = StyleSheet.create({
    sectionHeader: {
        marginBottom: 10,
        fontWeight: '500',
        fontSize: 22,
        fontFamily: 'Helvetica Neue',
    }
});

const mapStateToProps = state => {
    return {
        authExpired: state.account.loggedIn === false
    }
}

export default connect(mapStateToProps, { signOut, resetCommunities, resetProducts, resetRatings })(Settings);
