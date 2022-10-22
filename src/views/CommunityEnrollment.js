import React from 'react';
import { Text, ScrollView, View, StyleSheet, TextInput, Animated, Dimensions, Modal, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { findIconDefinition } from '@fortawesome/fontawesome-svg-core'
import fontAwesomeLibrary from "../../assets/icons/fontAwesomeLibrary";

import {
    listMoreCommunities,
    joinCommunity,
    leaveCommunity,
    listMoreEnrolledCommunities,
    searchCommunities
} from "../features/communities/communitiesSlice";
import AuthenticationProvider from "../components/AuthenticationProvider";
import CommunityListItem from "../components/CommunityListItem";
import Loader from "../components/Loader";
import { GRAY, YELLOW } from "../settings/colors";
import ErrorModal from "../components/ErrorModal";


// TODO -  Implement pagination for enrolled
const dimensions = Dimensions.get('window');

class CommunityEnrollment extends React.Component {
    state = {
        availableCommunitiesText: 'Trending',
        availableCommunities: [],
        searchString: '',
        enrolledSectionHeight: 0,
        searchSectionHeight: 0,
        communityPendingUnenrollment: null,
    }

    setAvailableCommunities = () => {
        let communities = []
        if (this.state.searchString !== "") {
            communities = this.props.searchResults;
            this.setState({ availableCommunitiesText: 'Search Results' });
        } else {
            communities = this.props.allCommunities;
            this.setState({ availableCommunitiesText: 'Trending' });
        }

        const enrolledIds = this.props.enrolledCommunities.map(community => {
            return community.id
        });

        const availableCommunities = communities.filter(community => {
            return !enrolledIds.includes(community.id)
        });

        this.setState({ availableCommunities: availableCommunities });
    }

    componentDidUpdate = (prevProps) => {
        if (
                prevProps.allCommunities !== this.props.allCommunities ||
                prevProps.enrolledCommunities !== this.props.enrolledCommunities ||
                prevProps.searchResults !== this.props.searchResults
        ) {
            this.setAvailableCommunities()
        }
    }

    getRequestStatus = () => {
        if (this.props.allCommunitiesRequestStatus === "expiredAuth") {
            return "expiredAuth";
        }

        if (this.props.enrolledCommunitiesRequestStatus === "expiredAuth") {
            return "expiredAuth";
        }

        if (this.props.searchRequestStatus === "expiredAuth") {
            return "expiredAuth";
        }

        if (this.props.joinRequestStatus === "expiredAuth") {
            return "expiredAuth";
        }

        if (this.props.leaveRequestStatus === "expiredAuth") {
            return "expiredAuth";
        }

        return "";
    }

    componentDidMount = () => {
        if (this.props.allCommunities.length === 0 && this.props.allCommunitiesRequestStatus === 'idle') {
            this.props.listMoreCommunities();
        }
        if (this.props.enrolledCommunities.length === 0 && this.props.enrolledCommunitiesRequestStatus === 'idle') {
            this.props.listMoreEnrolledCommunities();
        }
        this.setAvailableCommunities()
    }

    handleScroll = ({ layoutMeasurement, contentOffset, contentSize }) => {
        const buffer = 400;
        if (contentSize.height <= (layoutMeasurement.height + contentOffset.y + buffer)) {
            if (this.props.allCommunitiesRequestStatus !== 'loading') {
                this.props.listMoreCommunities();
            }
        }
    }

    renderDeleteButton = (progress, community) => {
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
                        accessibilityHint={`Press to leave the ${community.name} community.`}
                        onPress={ () => this.leaveCommunity(community) }>
                            <FontAwesomeIcon
                                color={ "white" }
                                size={ 20 }
                                icon={ findIconDefinition({prefix: 'fas', iconName: "trash-can"}) } />
                    </RectButton>
                </Animated.View>
            </View>
        )
    };

    leaveCommunity = (community) => {
        this.setState({ communityPendingUnenrollment: community })
        this.props.leaveCommunity(community)
        this.setState({ communityPendingUnenrollment: null })
    };

    renderCommunitiesList = (communityList, emptyMessage, requestStatus, itemType, swipeFunction) => {
        let i = 0;
        const community_elements = communityList.map(community => {
            let style = {};

            if (i === 0) {
                style = { borderTopWidth: 1 };
            }
            i++;

            let deleted = false;
            if (community.id === this.state.communityPendingUnenrollment?.id) {
                deleted = true;
            }

            let action;
            let actionType;
            if (itemType === "member") {
                action = () => {
                    this.props.navigation.navigate('Community Home', { communityId: community.id })
                }
                actionType = "enter"
            } else {
                action = () => this.props.joinCommunity(community);
                actionType = "add";
            }

            const communityComponent = (
                <CommunityListItem
                    key={ community.id }
                    community={ community }
                    action={ action }
                    actionType={ actionType }
                    accessibilityRole={ actionType === 'enter' ? 'link' : 'button' }
                    accessibilityHint={ actionType === 'enter' ? `Tap to open the ${community.display_name} page` : `Tap to join the ${community.display_name} community` }
                    style={ style }
                    hidden={ actionType === 'enter' ? deleted : null }
                    navigation={ this.props.navigation }/>
            )

            if (swipeFunction !== undefined) {
                return (
                    <Swipeable
                        key={ community.id }
                        withTestId={`swipeable-${community.id}`}
                        accessibilityRole="adjustable"
                        accessibilityHint={`Slide to reveal menu options for the ${community.name} community`}
                        friction={2}
                        rightThreshold={40}
                        renderRightActions={ progress => this.renderDeleteButton(progress, community) }>
                            { [ communityComponent ] }
                    </Swipeable>
                )
            } else {
                return communityComponent
            }
        });

        let message = null;
        if (communityList.length === 0 && requestStatus !== 'loading') {
            message = <Text style={ styles.emptyMessage }>{ emptyMessage} </Text>;
        }

        return (
            <React.Fragment>
                { community_elements }
                { message }
                <Loader
                    loading={ requestStatus === 'loading' }
                    contentOverlay={ false }
                    size={ 30 }
                    color={ GRAY }
                    minHeight={ 50 }/>
            </React.Fragment>
        );
    }

    renderEnrolledCommunitiesSection = () => {
        if (this.props.enrolledCommunities.length > 0) {
            return (
                <View
                    onLayout={ (e)=> this.setState({ enrolledSectionHeight: e.nativeEvent.layout.height }) }
                    style={{ flex: 1 }}
                >
                    <View style={ styles.subHeader }>
                        <Text style={ styles.subHeaderText }>Your Communities</Text>
                    </View>
                    <View style={ styles.communitiesContainer }>
                        { this.renderEnrolledCommunitiesList() }
                    </View>
                </View>
            )
        } else {
            return null;
        }
    }

    renderEnrolledCommunitiesList = () => {
        return this.renderCommunitiesList(
            this.props.enrolledCommunities,
            "You haven't joined any communities yet. Join some below.",
            this.props.enrolledCommunitiesRequestStatus,
            "member",
            this.renderDeleteButton
        )
    }

    renderAvailableCommunitiesList = () => {
        return this.renderCommunitiesList(
            this.state.availableCommunities,
            "No communities found",
            this.props.allCommunitiesRequestStatus,
            "non-member"
        )
    }

    searchSubmit = () => {
        this.props.searchCommunities({ searchString: this.state.searchString })
    }

    render = () => {
        return (
            <AuthenticationProvider
                requestStatus={ this.getRequestStatus() }
                navigation={ this.props.navigation }
            >
                <SafeAreaProvider>
                    <SafeAreaInsetsContext.Consumer>
                        {insets => <View style= {{ flex: 1 }}>
                            <View style={{ height: insets.top, backgroundColor: YELLOW }}>
                                <StatusBar backgroundColor={ YELLOW } barStyle={ 'dark-content' } />
                            </View>
                            <View style={ styles.foreground }>
                                <View style={[ styles.header, this.props.renderAsBottomSheet ? styles.bottomSheetHeader : {} ]}>
                                    <Text style={ styles.headerText }>Communities</Text>
                                </View>
                                <ScrollView
                                    nestedScrollEnabled={ true }
                                    decelerationRate={ 0.25 }
                                    contentContainerStyle={{ paddingBottom: 75 }}
                                >
                                    { this.renderEnrolledCommunitiesSection() }
                                    <View
                                        style={styles.searchContainer}
                                        onLayout={ (e)=> this.setState({ searchSectionHeight: e.nativeEvent.layout.height }) }
                                    >
                                        <View style={[ styles.subHeader ]}>
                                            <Text style={ styles.subHeaderText }>Join a Community</Text>
                                        </View>
                                        <View style={ styles.searchInputContainer }>
                                            <FontAwesomeIcon size={ 20 } icon={findIconDefinition({prefix: 'fas', iconName: "magnifying-glass"})} />
                                            <TextInput
                                                accessibilityRole="search"
                                                accessibilityHint="Search communities you are able to join"
                                                accessibilityLabel="Search Communities"
                                                style={ styles.searchInput }
                                                onSubmitEditing={ () => this.searchSubmit() }
                                                onChangeText={ (text) => this.setState({ searchString: text }) }
                                                returnKeyLabel="search"
                                                returnKeyType="search"
                                            />
                                        </View>
                                    </View>
                                    <View style={[ styles.subHeader ]}>
                                        <Text style={[ styles.subHeaderText ]}>{ this.state.availableCommunitiesText }</Text>
                                    </View>
                                    <ScrollView
                                        accessibilityHint="Scroll to see more communities to join."
                                        style={[ styles.communitiesContainer, {
                                            height: Math.max(350, (dimensions.height - 180 - this.state.enrolledSectionHeight - this.state.searchSectionHeight)),
                                        }]}
                                        nestedScrollEnabled={true}
                                        onScrollEndDrag={ ({ nativeEvent}) => this.handleScroll(nativeEvent) }>
                                        { this.renderAvailableCommunitiesList() }
                                    </ScrollView>
                                </ScrollView>
                            </View>
                            <ErrorModal errors={ this.props.errors }/>
                        </View>}
                    </SafeAreaInsetsContext.Consumer>
                </SafeAreaProvider>
            </AuthenticationProvider>
        )
    }
}

CommunityEnrollment.defaultProps = {
	renderAsBottomSheet: false
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        minHeight: '100%',
        width: '100%',
        backgroundColor: 'black'
    },
    foreground: {
        width: '100%',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        backgroundColor: '#F2F2F2',
    },
    header: {
        backgroundColor: YELLOW,
        width: '100%',
        paddingTop: 10,
        paddingBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomColor: 'black',
        borderBottomWidth: 1,
    },
    bottomSheetHeader: {
        paddingTop: 0,
    },
    communitiesContainer: {
        paddingBottom: 25
    },
    headerText: {
        paddingLeft: 20,
        paddingRight: 20,
        fontSize: 22,
        textAlign: 'center',
        fontWeight: '700'
    },
    subHeader: {
        marginLeft: 10,
        marginRight: 10,
        paddingBottom: 10,
        marginTop: 20,
        alignItems: 'flex-start',
    },
    subHeaderText: {
        paddingLeft: 10,
        paddingRight: 10,
        fontSize: 22,
        fontWeight: '600'
    },
    searchContainer: {
        alignItems: "flex-start",
        justifyContent: "center",
        marginTop: 10,
        marginBottom: 10,
    },
    searchInputContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        height: 45,
        marginLeft: 20,
        marginRight: 20,
        paddingLeft: 10,
        paddingRight: 10,
        alignItems: "center",
        width: dimensions.width - 40,
        flexDirection: "row",
    },
    searchInput: {
        fontSize: 20,
        fontWeight: "400",
        flex: 1,
        paddingLeft: 10
    },
    emptyMessage: {
        fontStyle: "italic",
        fontFamily: "Helvetica Neue",
        fontSize: 16,
        paddingTop: 15,
        paddingBottom: 5,
        paddingLeft: 15,
        paddingRight: 15,
        textAlign: "center"
    },
    deleteButton: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'red',
    },
});

const mapStateToProps = state => {
    return {
        allCommunities: state.communities.all,
        errors: state.communities.errors.length > 0 ? ["Please try again later. If the error persists, please reach out to support@everyonesacriticapp.com"] : [],
        allCommunitiesRequestStatus: state.communities.allCommunitiesRequestMetadata.status,
        enrolledCommunities: state.communities.enrolled,
        enrolledCommunitiesRequestStatus: state.communities.enrolledCommunitiesRequestMetadata.status,
        searchResults: state.communities.searchResults,
        searchRequestStatus: state.communities.searchRequestMetadata.status,
        joinRequestStatus: state.communities.joinRequestMetadata.status,
        leaveRequestStatus: state.communities.leaveRequestMetadata.status,
    }
}

export default connect(mapStateToProps, {
    listMoreCommunities, listMoreEnrolledCommunities, joinCommunity, leaveCommunity, searchCommunities
})(CommunityEnrollment);
