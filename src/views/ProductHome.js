import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, Image, View, ScrollView, Dimensions, Keyboard } from "react-native";
import { connect } from "react-redux";
import BottomSheet from '@gorhom/bottom-sheet';

import { getCommunity } from "../features/communities/communitiesSlice";
import { getProduct } from "../features/products/productsSlice";
import { getMostRecentRating } from "../features/ratings/ratingsSlice";
import CommunityPage from  "../components/CommunityPage";
import RatingBox from  "../components/RatingBox";
import FieldSet from  "../components/FieldSet";
import EditRating from  "./EditRating";
import { LIGHTGRAY } from "../settings/colors";

const windowHeight = Dimensions.get("window").height;
const SCROLL_LOCK_POSITION = 250;
const ProductHome = (props) => {
    const [ scrollEnabled, setScrollEnabled ] = useState(true);
    const [ bottomSheetVisible, setBottomSheetVisible ] = useState(false);
    const bottomSheet = useRef(null);
    const scrollComponent = useRef(null);

    useEffect(() => {
        props.getProduct({ id: props.route.params.productId });
        props.getMostRecentRating({ productId: props.route.params.productId })
        props.getCommunity({ id: props.route.params?.communityId });
    }, [ props.route.params?.productId ]);

    const openRatingSheet = () => {
        window.setTimeout(() => {
            scrollComponent.current.scrollTo({
                y: SCROLL_LOCK_POSITION, animated: true
            });
            bottomSheet.current.snapToIndex(0);
            setBottomSheetVisible(true);
            setScrollEnabled(false);
        }, 500);
    }

    const closeRatingSheet = () => {
        Keyboard.dismiss();
        bottomSheet.current.close();

    }

    const onBottomSheetReposition = isClosed => {
        if (isClosed) {
//             closeRatingSheet();
            setScrollEnabled(true);
            setBottomSheetVisible(false);
        }
    }

    const renderProductInfo = () => {
        const product = props.product;
        const community = props.community;
        if (product !== null && product !== undefined && community !== null && community !== undefined) {
            return (
                <React.Fragment>
                    <View style={ styles.imageContainer }>
                        <Image
                            resizeMode='center'
                            accessibilityLabel={`Image of ${product.name}`}
                            style={ styles.image }
                            source={{ uri: product.image_url }} />
                    </View>
                    <Text
                        accessibilityLabel="Product Brand"
                        style={[ styles.text, styles.brand ]}
                    >
                        { product.brand }
                    </Text>
                    <Text
                        accessibilityLabel="Product Name"
                        accessibilityRole="header" style={[ styles.text, styles.header ]}
                    >
                        { product.name }
                    </Text>
                    <RatingBox
                        onRemoveRating={ () => closeRatingSheet() }
                        onAddRating={ () => openRatingSheet() }
                        bottomSheetVisible={ bottomSheetVisible }
                        style={ styles.ratingBox }
                        community= { props.community }
                        product={ product } />
                    <View style={ styles.fieldContainer }>
                        <FieldSet
                            style={{ fontSize: 20 }}
                            fields={ props.community.primary_fields }
                            data={ product }
                            forceLabels={ true } />
                    </View>
                    <View style={[ styles.fieldContainer, { borderBottomWidth: 0 }]}>
                        <FieldSet
                            style={{ fontSize: 20 }}
                            fields={ props.community.secondary_fields }
                            data={ product }
                            forceLabels={ true } />
                    </View>
                </React.Fragment>
            )
        } else {
            return null;
        }

    }

    const renderBottomSheet = () => {
        const product = props.product;
        const community = props.community;
        if (product !== null && product !== undefined && community !== null && community !== undefined) {
            return (
                <BottomSheet
                    backgroundStyle={{ backgroundColor: `#${community.primary_color}` }}
                    enablePanDownToClose
                    ref={ bottomSheet }
                    index={ -1 }
                    snapPoints={[windowHeight - 250, windowHeight - 25]}
                    onChange={ posIndex => onBottomSheetReposition(posIndex === -1) }
                    handleIndicatorStyle = {{ backgroundColor: `#${community.secondary_color}` }}
                >
                    <EditRating
                        navigation={ props.navigation }
                        bottomSheetRef={ bottomSheet }
                        community={ community }
                        product={ product }
                    />
                </BottomSheet>
            );
        }
    }

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
            backButtonEnabled= { true }
        >
            <ScrollView
                scrollEnabled={ scrollEnabled }
                contentContainerStyle= {{ paddingBottom: 90 }}
                ref={ scrollComponent }
            >
                { renderProductInfo() }
            </ScrollView>
            { renderBottomSheet() }
        </CommunityPage>
    );
};

const styles = StyleSheet.create({
    imageContainer: {
        backgroundColor: 'white',
        alignItems: 'center',
    },
    image: {
        height: 250,
        width: "100%"
    },
    text: {
        fontFamily: "Helvetica Neue",
    },
    brand: {
        fontSize: 20,
        fontWeight: "400",
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 30,
        paddingBottom: 2,
        fontStyle: 'italic',
    },
    header: {
        fontSize: 22,
        fontWeight: "500",
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 2,
    },
    ratingBox: {
        marginLeft: 20,
        marginRight: 20,
        paddingTop: 25,
        paddingBottom: 30,
        borderBottomWidth: 1,
        borderColor: LIGHTGRAY,
    },
    fieldContainer: {
        paddingTop: 30,
        paddingBottom: 30,
        marginLeft: 20,
        marginRight: 20,
        borderBottomWidth: 1,
        borderColor: LIGHTGRAY,
    }
});

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
        const communityErrors = state.communities.errors;
        const productErrors = state.products.errors;
        const productId = state.products.focusedProduct?.id;
        const ratingErrors = state.ratings.errors[productId] || [];
        if (communityErrors.length > 0 || productErrors.length > 0 || ratingErrors.length  > 0) {
            console.log('communityErrors: ')
            console.log(communityErrors)
            console.log('productErrors: ')
            console.log(productErrors)
            console.log('ratingErrors: ')
            console.log(ratingErrors)

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
        rating: state.ratings.mostRecentRatings[state.products.focusedProduct?.id],
        loading: getLoading(),
        expiredAuth: checkForExpiredAuth(),
        errors: checkForErrors(),
    }
}

export default connect(mapStateToProps, { getCommunity, getProduct, getMostRecentRating })(ProductHome);
