import React, { useEffect } from 'react';
import { StyleSheet, FlatList, Text } from "react-native";
import { connect } from "react-redux";

import { getCommunity } from "../features/communities/communitiesSlice";
import { getProduct } from "../features/products/productsSlice";
import CommunityPage from  "../components/CommunityPage";


const ProductHome = (props) => {
    useEffect(() => {
        props.getProduct({ id: props.route.params.productId });
        props.getCommunity({ id: props.route.params?.communityId });
    }, [ props.route.params?.productId ]);

    const community = props.community;
    return (
        <CommunityPage
            community={ community }
            navigation= { props.navigation }
            route= { props.route }
            requestStatus={ props.expiredAuth }
            navigation={ props.navigation }
            errors = { props.errors }
            loading= { props.loading }
        >
            <Text>This is the product page for { props.product?.name } </Text>
        </CommunityPage>
    );
};

const styles = StyleSheet.create({});

const mapStateToProps = state => {
    const getLoading = () => {
        if (state.products.getOneRequestMetadata.status == 'loading' ||
                state.communities.getOneRequestMetadata.status == 'loading') {
            return true;
        } else {
            return false;
        }
    };

    const checkForExpiredAuth = () => {
        if (state.products.getOneRequestMetadata.status == 'expiredAuth' ||
                state.communities.getOneRequestMetadata.status == 'expiredAuth') {
            return 'expiredAuth';
        } else {
            return '';
        }
    };

    const checkForErrors = () => {
        if (state.communities.errors.length > 0 || state.products.errors.length > 0) {
            return [
                "Please try again later. If the error persists, please reach out to support@everyonesacriticapp.com"
            ];
        } else {
            return [];
        }
    }

    return {
        community: state.communities.focusedCommunity,
        product: state.products.focusedProduct,
        loading: getLoading(),
        expiredAuth: checkForExpiredAuth(),
        errors: checkForErrors(),
    }
}

export default connect(mapStateToProps, { getCommunity, getProduct })(ProductHome);
