import React from 'react';
import { Text, View, StyleSheet, Pressable } from "react-native";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { findIconDefinition } from '@fortawesome/fontawesome-svg-core'
import fontAwesomeLibrary from "../../assets/icons/fontAwesomeLibrary";

import { } from "../features/account/accountSlice";


const DeleteAccount = props => {
    const deleteAccount = () => {

    }

    return (
        <View style={{ flex: 1 }}>
            <Text>
                Are you sure you want to delete your account? All your data will be lost and this action cannot
                be undone.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
});

const mapStateToProps = state => {
    return {}
}

export default connect(mapStateToProps, {  })(DeleteAccount);