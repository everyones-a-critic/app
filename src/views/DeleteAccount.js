import React from 'react';
import { Text, View, StyleSheet, Pressable } from "react-native";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { findIconDefinition } from '@fortawesome/fontawesome-svg-core'
import fontAwesomeLibrary from "../../assets/icons/fontAwesomeLibrary";

import SettingsPage from '../components/SettingsPage';
import { deleteUser } from "../features/account/accountSlice";
import { reset as resetCommunities } from "../features/communities/communitiesSlice";
import { reset as resetProducts } from "../features/products/productsSlice";
import { reset as resetRatings } from "../features/ratings/ratingsSlice";


const DeleteAccount = props => {
    const deleteAccount = async () => {
        await props.deleteUser()
        props.resetCommunities();
        props.resetProducts();
        props.resetRatings();
        props.navigation.navigate('Sign In', { customMessage: "Your user was successfully deleted."})
    }

    return (
        <SettingsPage authExpired={ props.authExpired } navigation={ props.navigation }>
            <Text style={[ styles.text, styles.title ]} >Confirm Account Deletion</Text>
            <Text style={[ styles.text, styles.subTitle ]}>
                Are you sure you want to delete your account and its associated data? This action cannot be undone.
            </Text>
            <View style={ styles.buttonContainer }>
                <Pressable
                    onPress={() => deleteAccount() }
                    style={[ styles.button, styles.delete ]}
                >
                    <Text style={[ styles.text, styles.buttonText, styles.deleteText ]}>Yes - Delete</Text>
                </Pressable>
                <Pressable
                    onPress={() => props.navigation.navigate('Settings') }
                    style={[ styles.button, styles.cancel ]}
                >
                    <Text style={[ styles.text, styles.buttonText, styles.cancelText ]}>No - Cancel</Text>
                </Pressable>
            </View>
        </SettingsPage>
    );
}

const styles = StyleSheet.create({
    text: {
        fontFamily: 'Helvetica Neue',
        fontSize: 16,
    },
    title: {
        fontSize: 22,
        marginBottom: 15,
        marginTop: 15,
        fontWeight: '500',
    },
    subTitle: {
        fontSize: 18,
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 50,
    },
    button: {
        width: "50%",
        borderRadius: 5,
        borderWidth: 2,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        borderColor: 'red',
    },
    delete: {
        backgroundColor: 'red'
    },
    buttonText: {
        fontWeight: '500',
    },
    deleteText: {
        color: 'white'
    },
    cancel: {
        backgroundColor: 'transparent',
    },
    cancelText: {
        color: 'red'
    }
});

const mapStateToProps = state => {
    return {
        authExpired: state.account.loggedIn === false
    };
}

export default connect(mapStateToProps, { deleteUser, resetCommunities, resetProducts, resetRatings })(DeleteAccount);