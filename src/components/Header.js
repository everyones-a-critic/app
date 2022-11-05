import React from 'react';
import { Text, View, StyleSheet, Pressable, StatusBar } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WorkSans_800ExtraBold, useFonts } from '@expo-google-fonts/work-sans';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { findIconDefinition } from '@fortawesome/fontawesome-svg-core'
import fontAwesomeLibrary from "../../assets/icons/fontAwesomeLibrary";

import { pickBarStyle } from "../../utils";


const Header = props => {
    const insets = useSafeAreaInsets();

    let fontsLoaded;
    if (props.fontsLoaded === undefined) {
        [fontsLoaded] = useFonts({
            WorkSans_800ExtraBold
        });
    } else {
        fontsLoaded = props.fontsLoaded;
    }

    const renderBackButton = () => {
        if (props.backButtonEnabled) {
            let onPressFunc;
            if (props.navigation.canGoBack()) {
                onPressFunc = props.navigation.goBack;
            } else if (props.backButtonDefault !== null) {
                onPressFunc = props.backButtonDefault;
            }

            return (
                <View style={{ width: '17%', alignItems: 'center' }}>
                    <Pressable onPress={ () => onPressFunc() }>
                        <FontAwesomeIcon
                            color={ props.secondaryColor } size={ 25 }
                            icon={ findIconDefinition({prefix: 'fas', iconName: 'angle-left' }) } />
                    </Pressable>
                </View>
            );
        }

        return <View style={{ width: '17%', alignItems: 'center' }} />
    }

    const renderHeader = () => {
        if (props.title !== null) {
            if (fontsLoaded) {
                console.log("1")
                return (
                    <React.Fragment>
                        { renderBackButton() }
                        <View style={{ width: '66%', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                            <Text accessibilityRole="header" style = {[ styles.headerText, props.titleStyle, { color: props.secondaryColor }]}>
                                { props.title }
                            </Text>
                        </View>
                    </React.Fragment>
                );
            }
        } else {
            return (
                <React.Fragment>
                    { renderBackButton() }
                    { props.children }
                </React.Fragment>
            );
        }
    }

    return (
        <React.Fragment>
            <View style={{ height: insets.top, backgroundColor: props.primaryColor }}>
                <StatusBar hidden={ false } backgroundColor={ props.primaryColor } barStyle={ pickBarStyle(props.primaryColor) } />
            </View>
            <View style={[ styles.header, props.headerStyle, { backgroundColor: props.primaryColor }]}>
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
        justifyContent: 'flex-start',
    },
    headerText: {
        fontFamily: 'WorkSans_800ExtraBold',
        fontSize: 35,
        textTransform: 'uppercase',
    }
});

Header.defaultProps = {
    backButtonEnabled: false,
    backButtonDefault: null,
    headerStyle: {},
    titleStyle: {},
    title: null
}

export default Header;