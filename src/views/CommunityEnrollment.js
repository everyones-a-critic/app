import React from 'react';
import { Text, View, StyleSheet, TextInput, Dimensions, Modal, StatusBar, FlatList } from 'react-native';
import { SafeAreaProvider, SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { findIconDefinition } from '@fortawesome/fontawesome-svg-core'
import fontAwesomeLibrary from "../../assets/icons/fontAwesomeLibrary";

import {
    listMoreCommunities,
    listMoreEnrolledCommunities,
    searchCommunities
} from "../features/communities/communitiesSlice";
import AuthenticationProvider from "../components/AuthenticationProvider";
import CommunityListItem from "../components/CommunityListItem";
import Loader from "../components/Loader";
import { GRAY, YELLOW } from "../settings/colors";
import ErrorModal from "../components/ErrorModal";
const dimensions = Dimensions.get('window');


class CommunityEnrollment extends React.Component {
    state = {
        availableCommunitiesFocusedList: 'Trending',
        searchString: '',
    }

    componentDidMount = () => {
        if (this.props.availableCommunities.length === 0 && !this.props.availableCommunitiesLoading) {
            this.props.listMoreCommunities();
        }
        if (this.props.enrolledCommunities.length === 0 && !this.props.enrolledCommunitiesLoading) {
            this.props.listMoreEnrolledCommunities();
        }
    }

    renderEnrolledCommunitiesList = () => {
        return this.renderCommunitiesList(
            this.props.enrolledCommunities,
            this.props.enrolledCommunitiesLoading,
            "member",
            "You haven't joined any communities yet. Join some below.",
            () => this.props.listMoreEnrolledCommunities(),
            "Scroll to see more of your communities."
        );
    }

    renderAvailableCommunitiesList = () => {
        if (this.state.availableCommunitiesFocusedList === 'Trending') {
            return this.renderCommunitiesList(
                this.props.availableCommunities,
                this.props.availableCommunitiesLoading,
                "non-member",
                "No communities found",
                () => this.props.listMoreCommunities(),
                "Scroll to see more communities to join."
            );
        }
    }

    renderSearchResultsCommunitiesList = () => {
        if (this.state.availableCommunitiesFocusedList === 'Search Results') {
            return this.renderCommunitiesList(
                this.props.searchResults,
                this.props.searchResultsLoading,
                "non-member",
                "No results found",
                () => this.props.listMoreCommunities(),
                "Scroll to see more communities to join."
            );
        }
    }

    renderFlatListSpinner = loading => {
        if (loading) {
            return (
                <View style={{ width: "100%", height: 50 }}>
                    <Loader loading={ loading } contentOverlay={ false } size={ 25 } />
                </View>
            )
        }
    }

    renderCommunitiesList = (data, loading, itemType, emptyMessage, onEndReached, accessibilityHint) => {
        let emptyComponent = null;
        if (!loading) {
            emptyComponent = <Text style={ styles.emptyMessage }>{ !loading ? emptyMessage : '' }</Text>
        }

        return (
            <FlatList
                accessibilityHint={ accessibilityHint }
                showsVerticalScrollIndicator={ false }
                data={ data }
                initialNumToRender={ 8 }
                renderItem={ ({ item }) => {
                    return (
                        <CommunityListItem
                            key={ item.id }
                            visible={ this.props.visible }
                            community={ item }
                            itemType={ itemType }
                            navigation={ this.props.navigation }/>
                    )
                }}
                keyExtractor={ item => item.id }
                onEndReached={ onEndReached }
                onEndReachedThreshold={ .75 }
                contentContainerStyle={ styles.communitiesContainer }
                ListEmptyComponent={ emptyComponent }/>
        );
    }

    submitSearch = () => {
        if (this.state.searchString !== '') {
            this.props.searchCommunities({ searchString: this.state.searchString })
            this.setState({ availableCommunitiesFocusedList: 'Search Results' });
        } else {
            this.setState({ availableCommunitiesFocusedList: 'Trending' });
        }
    }

    renderStatusBar = (insets) => {
        if (!this.props.renderAsBottomSheet) {
            return (
                <View style={{ height: insets.top, backgroundColor: YELLOW }}>
                    <StatusBar backgroundColor={ YELLOW } barStyle={ 'light-content' } />
                </View>
            )
        }
    }

    render = () => {
        return (
            <AuthenticationProvider authExpired={ this.props.authExpired } navigation={ this.props.navigation }>
                <SafeAreaProvider>
                    <SafeAreaInsetsContext.Consumer>
                        { insets => <View style= {{ flex: 1 }}>
                            { this.renderStatusBar(insets) }
                            <View style={ styles.foreground }>
                                <View style={[ styles.header, this.props.renderAsBottomSheet ? styles.bottomSheetHeader : {} ]}>
                                    <Text style={ styles.headerText }>Communities</Text>
                                </View>
                                <View style = {{ width: "100%" }}>
                                    <View style={ styles.subHeader }>
                                        <Text style={ styles.subHeaderText }>Your Communities</Text>
                                    </View>
                                    { this.renderEnrolledCommunitiesList() }
                                    <View style={ styles.searchContainer }>
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
                                                onSubmitEditing={ () => this.submitSearch() }
                                                onChangeText={ (text) => this.setState({ searchString: text }) }
                                                returnKeyLabel="search"
                                                returnKeyType="search"
                                            />
                                        </View>
                                    </View>
                                    <View style={[ styles.subHeader ]}>
                                        <Text style={[ styles.subHeaderText ]}>{ this.state.availableCommunitiesFocusedList }</Text>
                                    </View>
                                    { this.renderAvailableCommunitiesList() }
                                    { this.renderSearchResultsCommunitiesList() }
                                </View>
                            </View>
                            <ErrorModal errors={ this.props.errors }/>
                        </View> }
                    </SafeAreaInsetsContext.Consumer>
                </SafeAreaProvider>
            </AuthenticationProvider>
        )
    }
}

CommunityEnrollment.defaultProps = {
	renderAsBottomSheet: false,
	visible: true
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
        height: "100%",
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
        paddingBottom: 25,
        width: dimensions.width - 40,
        marginLeft: 20,
        marginRight: 20,
        alignItems: 'center',
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
    }
});

const mapStateToProps = state => {
    const filterOutEnrolledCommunities = communities => {
        const enrolledIds = state.communities.enrolled.map(community => {
            return community.id
        });

        const availableCommunities = communities.filter(community => {
            return !enrolledIds.includes(community.id)
        });

        return availableCommunities;
    }

    const getIsAuthExpired = () => {
        if (
            state.communities.allCommunitiesRequestMetadata.status === "expiredAuth" ||
            state.communities.enrolledCommunitiesRequestMetadata.status === "expiredAuth" ||
            state.communities.searchRequestMetadata.status === "expiredAuth"
        ) {
            return true;
        } else {
            return false;
        }
    }

    return {
        availableCommunities: filterOutEnrolledCommunities(state.communities.all),
        availableCommunitiesLoading: state.communities.allCommunitiesRequestMetadata.status === "loading",
        enrolledCommunities: state.communities.enrolled,
        enrolledCommunitiesLoading: state.communities.enrolledCommunitiesRequestMetadata.status === "loading",
        searchResults: filterOutEnrolledCommunities(state.communities.searchResults),
        searchResultsLoading: state.communities.searchRequestMetadata.status === "loading",
        authExpired: getIsAuthExpired(),
        errors: state.communities.errors.length > 0 ? ["Please try again later. If the error persists, please reach out to support@everyonesacriticapp.com"] : [],
    }
}

export default connect(mapStateToProps, {
    listMoreCommunities, listMoreEnrolledCommunities, searchCommunities
})(CommunityEnrollment);
