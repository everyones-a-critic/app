import React from 'react';
import { Text, View } from "react-native";
import { } from "../features/communities/communitiesSlice";
import { connect } from "react-redux";


const CommunityHome = (props) => {
    const getCommunity = () => {
        let community = props.enrolledCommunities.find(community => {
            if (community.id === props.route.params?.communityId) {
                return community;
            }
        });

        if (community === undefined) {

            community = props.allCommunities.find(community => {
                if (community.id === props.route.params?.communityId) {
                    return community;
                }
            });
        }

        return community;
    }

    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text accessibilityRole="header">{ getCommunity().name }</Text>
        </View>
    )
}

const mapStateToProps = state => {
    return {
        allCommunities: state.communities.all,
        enrolledCommunities: state.communities.enrolled,
    }
}

export default connect(mapStateToProps, {})(CommunityHome);
