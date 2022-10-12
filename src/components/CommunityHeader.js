import React from 'react';
import { Text, View, StyleSheet, Pressable, StatusBar } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WorkSans_800ExtraBold } from '@expo-google-fonts/work-sans';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { findIconDefinition } from '@fortawesome/fontawesome-svg-core'
import fontAwesomeLibrary from "../../assets/icons/fontAwesomeLibrary";

import { pickBarStyle } from "../../utils";


const CommunityHeader = ({ community, bottomSheet, fontsLoaded }) => {
    const insets = useSafeAreaInsets();

    const navigateToCommunityEnrollment = () => {
        bottomSheet.current.expand(0);
    }

    let primaryColor = '#000000';
    let secondaryColor = '#FFFFFF';
    let iconName = 'gears';
    if (community !== undefined && community !== null) {
        primaryColor = `#${community.primary_color}`;
        secondaryColor = `#${community.secondary_color}`;
        iconName = community.icon;
    }

    const renderHeader = () => {
        if (fontsLoaded) {
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
                                { community?.name }
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
        <React.Fragment>
            <View style={{ height: insets.top, backgroundColor: primaryColor }}>
                <StatusBar backgroundColor={ primaryColor } barStyle={ pickBarStyle(primaryColor) } />
            </View>
            <View style={[ styles.header, { backgroundColor: primaryColor }]}>
                { renderHeader() }
            </View>
        </React.Fragment>
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

export default CommunityHeader;