import React from 'react';
import { Text, View, StyleSheet, Pressable } from "react-native";

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { findIconDefinition } from '@fortawesome/fontawesome-svg-core'
import fontAwesomeLibrary from "../../assets/icons/fontAwesomeLibrary";

import Header from '../components/Header';
import { YELLOW, SUPER_LIGHT_GRAY, LIGHT_GRAY } from '../settings/colors';

const SettingsRow = props => {

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={ props.title }
            onPress={ props.onPress } style={[ styles.row ]}
        >
            <View style={ styles.iconContainer }>
                <FontAwesomeIcon
                    color={ props.iconColor } size={ 25 }
                    icon={ findIconDefinition({prefix: 'fas', iconName: props.icon }) } />
            </View>
            <Text style={ styles.rowText }>{ props.title }</Text>
            <View style={ styles.arrowContainer }>
                <FontAwesomeIcon
                    color={ props.secondaryColor } size={ 18 }
                    icon={ findIconDefinition({prefix: 'fas', iconName: 'angle-right' }) } />
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    row: {
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        borderColor: LIGHT_GRAY,
        width: '100%',
        paddingLeft: 5,
        paddingRight: 5,
        height: 50,
    },
    iconContainer: {
        marginRight: 15,
    },
    rowText: {
        fontSize: 16,
        fontFamily: 'Helvetica Neue',
    },
    arrowContainer: {
        flex: 1,
        alignItems: 'flex-end',
    }
});

SettingsRow.defaultProps = {
    iconColor: 'black'
};

export default SettingsRow;