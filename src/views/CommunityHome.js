import React, { useEffect } from 'react';
import { StyleSheet, FlatList } from "react-native";
import { connect } from "react-redux";

import { getCommunity } from "../features/communities/communitiesSlice";
import { listMoreProducts } from "../features/products/productsSlice";
import CommunityPage from  "../components/CommunityPage";
import PillSet from "../components/PillSet";
import Pill from "../components/Pill";
import ProductCard from "../components/ProductCard";


// TODO:
// 1) Tests
// --
// 2) RatedProducts list
// 3) Add Pill selection and changing which list is presented


const CommunityHome = (props) => {
    const getMoreProducts = () => {
        const communityId = props.route.params.communityId;
        if (!props.productsLoading) {
            props.listMoreProducts({ communityId: communityId })
        }
    }

    useEffect(() => {
        props.getCommunity({ id: props.route.params.communityId });
        getMoreProducts();
    }, [ props.route.params?.communityId ]);

    const community = props.community;
    const allProducts = props.allProducts[community?.id] || [];

    return (
        <CommunityPage
            community={ props.community }
            navigation= { props.navigation }
            route= { props.route }
            requestStatus={ props.authExpired }
            navigation={ props.navigation }
            errors = { props.errors }
        >
            <PillSet style={ styles.pillContainer }>
                <Pill
                    title={ "Recommended" }
                    primaryColor={ `#${community?.primary_color}` }
                    secondaryColor={ `#${community?.secondary_color}` }
                    startSelected
                />
                <Pill
                    title={ "Your Reviews" }
                    primaryColor={ `#${community?.primary_color}` }
                    secondaryColor={ `#${community?.secondary_color}` }
                />
            </PillSet>
            <FlatList
                removeClippedSubviews
                showsVerticalScrollIndicator={ false }
                data={ allProducts }
                initialNumToRender={ 2 }
                refreshing= { props.productsLoading }
                renderItem={ ({item}) => <ProductCard key={ item.id } navigation={ props.navigation } product={ item } fields={ community?.primary_fields }/> }
                keyExtractor={ item => item.id }
                onEndReached={ () => getMoreProducts() }
                onEndReachedThreshold={ .75 }
                contentContainerStyle={{ alignItems: 'center', paddingBottom: 150 }}
            />
        </CommunityPage>
    );
};

const styles = StyleSheet.create({
    pillContainer: {
        marginBottom: 15,
        height: 70,
    },
});

const mapStateToProps = state => {
    const checkForLoadingProductsRequests = () => {
        return Object.keys(state.products.allByCommunityRequestMetadata).forEach(key => {
            if (state.products.allByCommunityRequestMetadata.key?.status === 'loading') {
                return true;
            }
        });
    };

    const checkForExpiredAuth = () => {
        const productAuthExpired = Object.keys(state.products.allByCommunityRequestMetadata).forEach(key => {
            if (state.products.allByCommunityRequestMetadata.key?.status === 'expiredAuth') {
                return true;
            }
        });

        if (productAuthExpired || state.communities.getOneRequestMetadata.status == 'expiredAuth') {
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
        productsLoading: checkForLoadingProductsRequests(),
        allProducts: state.products.allByCommunity,
        authExpired: checkForExpiredAuth(),
        errors: checkForErrors(),
    }
}

export default connect(mapStateToProps, { getCommunity, listMoreProducts })(CommunityHome);
