import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList } from "react-native";
import { connect } from "react-redux";
import { setItemAsync } from 'expo-secure-store';

import { getCommunity } from "../features/communities/communitiesSlice";
import { listMoreProducts, listMoreProductsWithRatings } from "../features/products/productsSlice";
import CommunityPage from  "../components/CommunityPage";
import PillBox from "../components/PillBox";
import Pill from "../components/Pill";
import ProductCard from "../components/ProductCard";


// TODO:
// 1) Tests
// --
// 2) RatedProducts list
// 3) Add Pill selection and changing which list is presented


const CommunityHome = (props) => {
    const communityId = props.route.params?.communityId;
    const [selectedProductList, setSelectedProductList] = useState("Browse")

    const getMoreProducts = () => {
        if (!props.productsLoading && communityId != null) {
            if (selectedProductList === "Browse") {
                props.listMoreProducts({ communityId: communityId })
            } else {
                props.listMoreProductsWithRatings({ communityId: communityId })
            }
        }
    }

    useEffect(() => {
        setItemAsync('MostRecentCommunityId', props.route.params.communityId);
        props.getCommunity({ id: props.route.params.communityId });
        getMoreProducts();
    }, [ communityId, selectedProductList ]);

    const renderProductList = () => {
        const data = selectedProductList === "Browse" ? props.allProducts : props.productsWithRatings

        return (
            <FlatList
                removeClippedSubviews
                showsVerticalScrollIndicator={ false }
                data={ data }
                initialNumToRender={ 2 }
                refreshing= { props.productsLoading }
                renderItem={ ({item}) => <ProductCard key={ item.id } navigation={ props.navigation } product={ item } fields={ community?.primary_fields }/> }
                keyExtractor={ item => item.id }
                onEndReached={ () => getMoreProducts() }
                onEndReachedThreshold={ .75 }
                contentContainerStyle={{ alignItems: 'center', paddingBottom: 175 }}/>
        )
    }

    const community = props.community;
    return (
        <CommunityPage
            community={ props.community }
            navigation= { props.navigation }
            route= { props.route }
            requestStatus={ props.authExpired }
            navigation={ props.navigation }
            errors = { props.errors }
        >
            <PillBox
                accessibilityLabel={ "Select Product Category" }
                scrollable style={ styles.pillContainer }
                pills={[
                    { value: "Browse" },
                    { value: "Your Reviews" },
                ]}
                primaryColor={ `#${community?.primary_color}` }
                secondaryColor={ `#${community?.secondary_color}` }
                selected={ "Browse" }
                pillContainerStyle={ styles.pill }
                onChange={ value => setSelectedProductList(value) }
            />
            { renderProductList() }
        </CommunityPage>
    );
};

const styles = StyleSheet.create({
    pillContainer: {
        marginBottom: 15,
        paddingLeft: 15,
        height: 70,
    },
    pill: {
        borderLeftWidth: 2,
        borderRightWidth: 2,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
        margin: 10,
    }
});

const mapStateToProps = state => {
    const communityId = state.communities.focusedCommunity?.id;
    const checkForLoadingProductsRequests = () => {
        const allProductsLoading = Object.keys(state.products.allByCommunityRequestMetadata).forEach(key => {
            if (state.products.allByCommunityRequestMetadata[key]?.status === 'loading') {
                return true;
            }
        })

        const productsWithRatingsLoading = Object.keys(state.products.allWithRatingsByCommunityRequestMetadata).forEach(key => {
            if (state.products.allWithRatingsByCommunityRequestMetadata[key]?.status === 'loading') {
                return true;
            }
        })

        return allProductsLoading || productsWithRatingsLoading || false;
    };

    const checkForExpiredAuth = () => {
        const productAuthExpired = Object.keys(state.products.allByCommunityRequestMetadata).forEach(key => {
            if (state.products.allByCommunityRequestMetadata[key]?.status === 'expiredAuth') {
                return true;
            }
        });

        const withRatingsAuthExpired = Object.keys(state.products.allWithRatingsByCommunityRequestMetadata).forEach(key => {
            if (state.products.allByCommunityRequestMetadata[key]?.status === 'expiredAuth') {
                return true;
            }
        });

        const ratingsAuthExpired = Object.keys(state.ratings.requestMetadata).forEach(key => {
            if (state.ratings.requestMetadata[key]?.status === 'expiredAuth') {
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
        allProducts: state.products.allByCommunity[communityId],
        productsWithRatings: state.products.allWithRatingsByCommunity[communityId],
        authExpired: checkForExpiredAuth(),
        errors: checkForErrors(),
    }
}

export default connect(mapStateToProps, { getCommunity, listMoreProducts, listMoreProductsWithRatings })(CommunityHome);
