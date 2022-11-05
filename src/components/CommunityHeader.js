import React from 'react';
import { Text, View, StyleSheet, Pressable } from "react-native";

import { WorkSans_800ExtraBold } from '@expo-google-fonts/work-sans';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { findIconDefinition } from '@fortawesome/fontawesome-svg-core'
import fontAwesomeLibrary from "../../assets/icons/fontAwesomeLibrary";

import Header from "./Header";
import { pickBarStyle } from "../../utils";


const CommunityHeader = props => {
    const navigateToCommunityEnrollment = () => {
        props.bottomSheet.current.expand(0);
        props.onBottomSheetOpen();
    }

    let primaryColor = '#000000';
    let secondaryColor = '#FFFFFF';
    let iconName = 'gears';
    if (props.community !== undefined && props.community !== null) {
        primaryColor = `#${props.community.primary_color}`;
        secondaryColor = `#${props.community.secondary_color}`;
        iconName = props.community.icon;
    }

    const renderHeader = () => {
        if (props.fontsLoaded) {
            return (
                <React.Fragment>
                    <Pressable
                        accessibilityRole="link"
                        accessibilityLabel="Change Community"
                        accessibilityHint="Navigate to the community enrollment screen, where you can navigate to a different community"
                        onPress={() => navigateToCommunityEnrollment() }
                        style={{ width: '66%', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}
                    >
                        <Text
                            accessibilityRole="header"
                            style = {[ styles.headerText, { color: secondaryColor }]}>
                                { props.community?.name }
                        </Text>
                        <Text style={{ marginTop: 5 }}>
                            <FontAwesomeIcon
                                style={{ transform: [{translateX: 8 }] }}
                                color={ secondaryColor }
                                size={ 22 }
                                icon={ findIconDefinition({prefix: 'fas', iconName: 'angle-down' }) } />
                        </Text>
                    </Pressable>
                    <View style={{ width: '17%', alignItems: 'center' }}>
                        <FontAwesomeIcon
                            color={ secondaryColor } size={ 25 }
                            icon={ findIconDefinition({prefix: 'fas', iconName: iconName }) } />
                    </View>
                </React.Fragment>
            );
        }
    }

    return (
        <Header
            headerStyle={{ justifyContent: 'flex-end' }}
            primaryColor={ primaryColor }
            secondaryColor={ secondaryColor }
            backButtonEnabled={ props.backButtonEnabled }
            navigation={ props.navigation }
            fontsLoaded={ props.fontsLoaded }
        >
            { renderHeader() }
        </Header>
    );
}

const styles = StyleSheet.create({
    header: {
        height: 65,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    headerText: {
        fontFamily: 'WorkSans_800ExtraBold',
        fontSize: 35,
        textTransform: 'uppercase',
    }
});

CommunityHeader.defaultProps = {
    backButtonEnabled: false
}

export default CommunityHeader;