import React, { useEffect, useState } from 'react';
import { connect } from "react-redux";
import { StyleSheet, Animated, Image, View, Text, TouchableWithoutFeedback } from 'react-native';
import { setItemAsync, getItemAsync } from 'expo-secure-store';


import { useFonts, WorkSans_800ExtraBold } from '@expo-google-fonts/work-sans';

import IcomoonIcon from '../components/IcomoonIcon';
import { iconList } from "react-native-icomoon";
import json from '../selection.json'

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { findIconDefinition } from '@fortawesome/fontawesome-svg-core'
import fontAwesomeLibrary from "../../assets/icons/fontAwesomeLibrary";

import { getCommunity } from "../features/communities/communitiesSlice";
import { YELLOW } from "../settings/colors";
import { hexToRGB } from '../../utils'

let splashTimer;
const SplashScreen = props => {
    const [fontsLoaded] = useFonts({ WorkSans_800ExtraBold });

    const [colorAnimation, setColorAnimation] = useState(new Animated.Value(0));
    const [mainHeaderOpacity, setMainHeaderOpacity] = useState(new Animated.Value(0));
    const [mainIconOpacity, setMainIconOpacity] = useState(new Animated.Value(0));
    const [secondaryHeaderOpacity, setSecondaryHeaderOpacity] = useState(new Animated.Value(0));
    const [secondaryHeaderFontSize, setSecondaryHeaderFontSize] = useState(new Animated.Value(0));

    const [readyFor, setReadyFor] = useState(null);
    const [hasEverLoggedIn, setHasEverLoggedIn] = useState(false);
    const [page, setPage] = useState('primary');

    const [isMounted, setIsMounted] = useState(false);

    const backgroundColor = colorAnimation.interpolate({
        inputRange: [0, 1],
        outputRange:["rgb(250,194,19)" , hexToRGB(props.community?.primary_color || "000000")]
    });
    const textColor = colorAnimation.interpolate({
        inputRange: [0, 1],
        outputRange:["rgb(1,1,1)" , hexToRGB(props.community?.secondary_color || "FFFFFF")]
    });

    // Animations

    const fadeInPrimaryTitle = () => {
        Animated.timing(mainHeaderOpacity, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false
        }).start();

        Animated.timing(mainIconOpacity, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false
        }).start();
    }

    const transitionToSecondaryPage = () => {
        const animationDuration = 2000;
        Animated.timing(colorAnimation, {
            toValue: 1,
            duration: animationDuration,
            useNativeDriver: false
        }).start();

        Animated.timing(mainIconOpacity, {
            toValue: 0,
            duration: animationDuration,
            useNativeDriver: false
        }).start(() => {
            setPage('secondary');
            Animated.timing(secondaryHeaderOpacity, {
                toValue: 1,
                duration: animationDuration,
                useNativeDriver: false
            }).start();
        });

        const fontSizeMap = {
            1: 100, 2: 100, 3: 100, 4: 100, 5: 100,
            6: 90, 7: 75, 8: 65, 9: 56, 10: 52,
            11: 48, 12: 44, 13: 40, 14: 38, 15: 36,
            16: 34, 17: 32, 18: 30, 19: 28, 20: 26,
        }
        Animated.timing(secondaryHeaderFontSize, {
            toValue: fontSizeMap[props.community?.name?.length] || 25,
            duration: animationDuration,
            useNativeDriver: false
        }).start(() => {
            splashTimer = window.setTimeout(() => {
                setReadyFor('navigateToCommunityHome');
            }, 3000);
        });
    }

    // Data Loading

    const loadSetupData = async() => {
        const token = await getItemAsync('RefreshToken');
        if (token !== undefined && token !== null) {
            setHasEverLoggedIn(true);
            const communityId = await getItemAsync('MostRecentCommunityId');
            if (communityId !== undefined && communityId !== null) {
                props.getCommunity({ id: communityId });
            }
        }
    }

    // Lifecycle monitoring

    useEffect(() => {
        if (readyFor === "navigateToCommunityHome") {
            props.navigation.navigate('Community Home', { communityId: props.community.id });
        }
    }, [ readyFor ]);

    useEffect(() => {
        // if user has never logged in route to Sign Up
        // if user has logged in, but auth has expired, route to sign up
        // if user has logged in and community fetch was successful, update splash page to community splash page
        if (isMounted) {
            if (readyFor === 'secondaryPage' && props.requestStatus !== 'loading') {
                if (!hasEverLoggedIn) {
                    props.navigation.navigate('Sign Up');
                } else if (props.requestStatus == 'expiredAuth'){
                    props.navigation.navigate('Sign In');
                } else if (props.community !== undefined && props.community !== null) {
                    transitionToSecondaryPage()
                } else {
                    props.navigation.navigate('Community Enrollment');
                }
            }
        }
    }, [hasEverLoggedIn, readyFor, props.community, props.requestStatus]);

    useEffect(() => {
        setIsMounted(true);
        fadeInPrimaryTitle();
        loadSetupData();

        splashTimer = window.setTimeout(() => {
            setReadyFor('secondaryPage');
        }, 3000);

        props.navigation.addListener('blur', () => {
            tearDown();
        });

        return () => {
            tearDown();
        }
    }, [])

    const tearDown = () => {
        window.clearTimeout(splashTimer);
        setIsMounted(false);
    }

    const renderIcon = () => {
        if (page === 'primary') {
            return (
                <Animated.Text style={[ styles.mainIcon, { opacity: mainIconOpacity, color: textColor }]}>
                    <IcomoonIcon size={150} name="icon"/>
                </Animated.Text>
            )
        } else {
            return (
                <Animated.Text style={[ styles.categoryIcon, { opacity: secondaryHeaderOpacity }]}>
                    <FontAwesomeIcon
                        color={`#${props.community?.secondary_color}`}
                        size={150}
                        icon={ findIconDefinition({prefix: 'fas', iconName: props.community.icon }) } />
                </Animated.Text>
            )
        }
    }

    if (!fontsLoaded) {
        return <View style={styles.container} />;
    } else {
        return (
            <View style={styles.container}>
                <Animated.View style={{...styles.container, backgroundColor: backgroundColor }}>
                    <Animated.Text style={[ styles.title, { color: textColor, opacity: mainHeaderOpacity }]}>Everyone's a</Animated.Text>
                    <Animated.Text style={[ styles.title, { color: textColor, fontSize: secondaryHeaderFontSize, opacity: secondaryHeaderOpacity }]}>{ props.community?.name }</Animated.Text>
                    { renderIcon() }
                    <Animated.Text style={[styles.title, { color: textColor, opacity: mainHeaderOpacity }]}>Critic</Animated.Text>
                </Animated.View>
            </View>
        );
    }
}

const desiredFont = 'WorkSans_800ExtraBold'
const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontFamily: desiredFont,
        fontSize: 45,
        textTransform: 'uppercase',
        margin: 0,
        padding: 0
    },
    mainIcon: {
        marginTop: 25,
        marginBottom: 25,
        // center alignment not working, so setting specific width
        width: 85,
    },
    categoryIcon: {
        marginTop: 25,
        marginBottom: 25,
        color: 'white',
    }
});

const mapStateToProps = state => {
    return {
        community: state.communities.focusedCommunity,
        requestStatus: state.communities.getOneRequestMetadata.status,
    }
}

export default connect(mapStateToProps, { getCommunity })(SplashScreen);