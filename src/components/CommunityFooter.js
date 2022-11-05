import React from 'react';
import { Text, View, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { findIconDefinition } from '@fortawesome/fontawesome-svg-core'
import fontAwesomeLibrary from "../../assets/icons/fontAwesomeLibrary";

import { SUPER_LIGHT_GRAY } from "../settings/colors";


const CommunityFooter = props => {
    const insets = useSafeAreaInsets();

    let primaryColor = '#000000';
    let secondaryColor = '#FFFFFF';
    if (props.community !== undefined && props.community !== null) {
        primaryColor = `#${props.community.primary_color}`;
        secondaryColor = `#${props.community.secondary_color}`;
    }

    const navigateToCommunityEnrollment = () => {
        props.bottomSheet.current.expand(0);
        props.onBottomSheetOpen();
    }

    const navigateToCommunityHome = () => {
        props.navigation.navigate('Community Home', { communityId: props.community.id })
    }

    return (
        <View style={[ styles.footerContainer, { borderColor: primaryColor, height: 60 + insets.bottom, paddingBottom: insets.bottom }]}>
            <Pressable
                accessibilityRole="link"
                accessibilityLabel="Community Home Link"
                style={ styles.button }
                onPress={ () => navigateToCommunityHome() }
            >
                <FontAwesomeIcon
                    color={ primaryColor } size={ 28 }
                    icon={ findIconDefinition({prefix: 'fas', iconName: 'home' }) } />
                <Text style={ styles.buttonLabel }>Home</Text>
            </Pressable>
            <Pressable
                accessibilityRole="link"
                accessibilityLabel="Community Enrollment Link"
                style={ styles.button } onPress={ () => navigateToCommunityEnrollment() }>
                <FontAwesomeIcon
                    color={ primaryColor } size={ 28 }
                    icon={ findIconDefinition({prefix: 'fas', iconName: 'right-left' }) } />
                    <Text style={ styles.buttonLabel }>Switch</Text>
            </Pressable>
            <Pressable
                accessibilityRole="link"
                accessibilityLabel="Account Settings Link"
                style={ styles.button } onPress={ () => props.navigation.navigate('Settings') }
            >
                <FontAwesomeIcon
                    color={ primaryColor } size={ 28 }
                    icon={ findIconDefinition({prefix: 'fas', iconName: 'user' }) } />
                    <Text style={ styles.buttonLabel }>Account</Text>
            </Pressable>
{/*             <Pressable style={ styles.button } onPress={ () => {} }> */}
{/*                 <FontAwesomeIcon */}
{/*                     color={ primaryColor } size={ 28 } */}
{/*                     icon={ findIconDefinition({prefix: 'fas', iconName: 'ellipsis' }) } /> */}
{/*                     <Text style={ styles.buttonLabel }>More</Text> */}
{/*             </Pressable> */}
        </View>
    );
}

const styles = StyleSheet.create({
    footerContainer: {
        backgroundColor: SUPER_LIGHT_GRAY,
        borderTopWidth: 2,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        height: '100%'
    },
    buttonLabel: {
        marginTop: 5,
        fontSize: 10,
        fontFamily: 'Helvetica Neue',
    }
});

CommunityFooter.defaultProps = {}

export default CommunityFooter;