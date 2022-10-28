import React, { useState, useEffect } from 'react';
import { Pressable, Text, View, StyleSheet, Animated } from "react-native";
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import fontAwesomeLibrary from "../../assets/icons/fontAwesomeLibrary";
import { findIconDefinition } from '@fortawesome/fontawesome-svg-core'

import AuthenticationProvider from "./AuthenticationProvider";
import { joinCommunity, leaveCommunity } from "../features/communities/communitiesSlice";


let deleteButtonExposed = false
const CommunityListItem = props => {
    const [isMounted, setIsMounted] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [disabled, setDisabled] = useState(false);

    useEffect(() => {
        setIsMounted(true);

        props.navigation.addListener('blur', () => {
            setDisabled(false);
            setIsMounted(false);
        });

        return () => {
            setDisabled(false);
            setIsMounted(false);
        };
    }, []);

    const renderDeleteButton = (progress) => {
        const trans = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [65, 0],
        });

        return (
            <View style={{ width: 65 }}>
                <Animated.View style={{ flex: 1, transform: [{ translateX: trans }] }}>
                    <RectButton
                        style={ styles.deleteButton }
                        accessibilityRole="button"
                        accessibilityHint={`Press to leave the ${props.community.name} community.`}
                        onPress={ () => {
                            deleteButtonExposed = false;
                            leaveCommunity(props.community);
                        }}>
                            <FontAwesomeIcon
                                color={ "white" }
                                size={ 20 }
                                icon={ findIconDefinition({prefix: 'fas', iconName: "trash-can"}) } />
                    </RectButton>
                </Animated.View>
            </View>
        )
    };

    const leaveCommunity = () => {
        setHidden(true)
        props.leaveCommunity(props.community)
    };

    const renderDeletableListItem = () => {
        if (props.itemType == "member") {
            return (
                <Swipeable
                    key={ props.community.id }
                    containerStyle={{ width: "100%" }}
                    childrenContainerStyle={{ width: "100%" }}
                    withTestId={`swipeable-${props.community.id}`}
                    accessibilityRole="adjustable"
                    accessibilityHint={`Slide to reveal menu options for the ${props.community.name} community`}
                    friction={ 2 }
                    rightThreshold={ 40 }
                    onSwipeableWillOpen={() => deleteButtonExposed = true }
                    onSwipeableClose={() => deleteButtonExposed = false }
                    renderRightActions={ progress => renderDeleteButton(progress) }>
                        { renderListItem() }
                </Swipeable>
            )
        } else {
            return null;
        }
    }

    const renderActionIcon = () => {
        const size = 18;
        if (props.itemType === "non-member") {
            return (
                <View style={ styles.actionIconContainer }>
                    <FontAwesomeIcon
                        style={{ transform: [{translateY: 4 }] }}
                        size={ size }
                        icon={ findIconDefinition({ prefix: 'fas', iconName: 'plus' }) } />
                </View>
            )
        } else {
            return (
                <View style={ styles.actionIconContainer }>
                    <FontAwesomeIcon
                        style={{ transform: [{translateY: 2 }]}}
                        size={ size }
                        icon={ findIconDefinition({ prefix: 'fas', iconName: 'angles-right' }) } />
                </View>
            )
        }
    }

    const performAction = () => {
        if (props.itemType === "member") {
            props.navigation.navigate('Community Home', { communityId: props.community.id })
        } else {
            props.joinCommunity(props.community);
        }
    }

    const onPress = async () => {
        // very slight delay because onSwipeableWillOpen doesn't really when Swipeable starts moving
        // https://github.com/software-mansion/react-native-gesture-handler/issues/935
        const triggerPress = async () => {
            if (!deleteButtonExposed) {
                setDisabled(true);
                await performAction();

                if (isMounted) {
                    setDisabled(false);
                }
            }
        }
        if (props.itemType == "member") {
            await window.setTimeout( async() => {
                await triggerPress();
            }, 150);
        } else {
            await triggerPress();
        }
    }

    const renderListItem = () => {
        const iconDef = findIconDefinition({prefix: 'fas', iconName: props.community.icon})
        let accessibilityHint = `Tap to join the ${props.community.display_name} community`;
        let accessibilityRole = "button";
        if (props.itemType === 'member') {
            accessibilityHint =  `Tap to open the ${props.community.display_name} page`
            let accessibilityRole = "link";
        }

        return (
            <AuthenticationProvider authExpired={ props.authExpired } navigation={ props.navigation }>
                <Pressable
                    onPress={() => onPress()}
                    disabled={ disabled }
                    accessibilityState={ disabled ? 'disabled' : null }
                    accessibilityRole={ accessibilityRole }
                    accessibilityHint={ accessibilityHint }
                    style={[ styles.communityContainer, {
                        display: hidden ? "none" : "flex",
                        opacity: disabled ? 0.5 : 1
                    }]}>
                    <View style={[styles.communityIconBackground, {backgroundColor: `#${props.community.primary_color}`}]}>
                        <FontAwesomeIcon size={22} color={`#${props.community.secondary_color}`} icon={iconDef}/>
                    </View>
                    <View style={[ styles.nameContainer, props.style ]}>
                        <Text style={styles.communityName}>{props.community.display_name}</Text>
                        { renderActionIcon() }
                    </View>
                </Pressable>
            </AuthenticationProvider>
        )
    }

    if (props.itemType === "member") {
        return renderDeletableListItem();
    } else {
        return renderListItem();
    }
}

CommunityListItem.defaultProps = {
    style: {},
    disabled: false
}

const styles = StyleSheet.create({
    communityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: "100%",
    },
    nameContainer: {
        borderBottomWidth: 1,
        borderColor: "#808080",
        paddingTop: 15,
        flex: 1,
        flexDirection: 'row',
        paddingBottom: 15,
    },
    communityName: {
        fontSize: 22,
        fontWeight: '400',
        flex: 1,
    },
    communityIconBackground: {
        width: 35,
        height: 35,
        borderRadius: "50%",
        marginRight: 20,
        alignItems: "center",
        justifyContent: "center"
    },
    actionIconContainer: {
        paddingLeft: 10,
        paddingRight: 10,
        alignItems: "center",
    },
    deleteButton: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'red',
    },
});

const mapStateToProps = state => {
    const getAuthExpired = () => {
        if (state.communities.joinRequestMetadata.status === 'expiredAuth') {
            return true;
        }
        if (state.communities.leaveRequestMetadata.status === 'expiredAuth') {
            return true;
        }

        return false;
    }

    return {
        authExpired: getAuthExpired()
    };
}

export default connect(mapStateToProps, { joinCommunity, leaveCommunity })(CommunityListItem);
