import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, Pressable, View } from "react-native";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { findIconDefinition } from '@fortawesome/fontawesome-svg-core'
import fontAwesomeLibrary from "../../assets/icons/fontAwesomeLibrary";

import AuthenticationProvider from "./AuthenticationProvider";
import { createOrUpdateRating, archiveRating } from "../features/ratings/ratingsSlice";
import { removeRatingFromProduct, addRatingToProduct } from "../features/products/productsSlice";
import { GRAY } from "../settings/colors";


const RatingIcon = (props) => {
    const [pressed, setPressed] = useState(props.selected);
    const [previousRatingId, setPreviousRatingId] = useState(null);
    const selected = props.value === props.rating?.roundedRating;

    const onPress = async () => {
        if (selected) {
            if (!props.bottomSheetVisible) {
                props.onAddRating();
            } else {
                props.archiveRating({
                    productId: props.focusedProductId,
                    ratingId: props.rating.id
                });
                props.removeRatingFromProduct({
                    communityId: props.communityId,
                    ratingId: props.rating.id
                })
                props.onRemoveRating();
            }
        } else {
            setPreviousRatingId(props.rating?.id)
            props.createOrUpdateRating({
                productId: props.focusedProductId,
                rating: props.value - .33
            });
            props.onAddRating();
        }
    }

    useEffect(() => {
        if (
            props.rating?.id !== undefined && props.rating?.id !== null && previousRatingId !== null &&
            previousRatingId !== props.rating?.id
        ) {
            props.addRatingToProduct({
                productId: props.focusedProductId,
                communityId: props.communityId,
                rating: props.rating
            })
        }
    }, [props.rating?.id]);

    const getIconStyles = () => {
        let styles = {};
        if (pressed) {
            styles.transform = [{translateY: -2}, {translateX: 1}]
        }

        return styles;
    }

    return (
        <AuthenticationProvider authExpired={ props.authExpired } navigation={ props.navigation }>
            <Pressable
                accessibilityRole="radio"
                accessibilityValue={{ text: props.value }}
                accessibilityLabel={ props.value.toString() }
                accessibilityHint={ `Rate this product a ${props.value}` }
                onPressIn={ () => setPressed(true) }
                onPressOut={ () => setPressed(false) }
                onPress={ () => onPress() }
                style={ styles.button }
                disabled={ props.disabled }
            >
                <FontAwesomeIcon
                    color={ props.disabled ? GRAY : props.color }
                    style={ getIconStyles() }
                    size={ 35 }
                    icon={ findIconDefinition({prefix: selected ? 'fas' : 'far', iconName: props.icon }) } />
            </Pressable>
        </AuthenticationProvider>
    );
};

RatingIcon.defaultProps = {
    selected: false
};

const styles = StyleSheet.create({
    button: {
        width: 45,
        height: 45,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 5,
        marginRight: 5,
    }
});

const mapStateToProps = state => {
    const productId = state.products.focusedProduct?.id;

    const getRequestStatus = () => {
        const requestMetadata = state.ratings.requestMetadata[productId]
        return requestMetadata?.status;
    };

    const getDisabled = () => {
        const requestStatus = getRequestStatus();
        if (requestStatus === 'loading') {
            return true;
        } else {
            return false;
        }
    }

    return {
        focusedProductId: productId,
        communityId: state.products.focusedProduct?.community_id,
        rating: state.ratings.mostRecentRatings[productId],
        errors: state.ratings.errors[productId] || [],
        requestStatus: getRequestStatus(),
        authExpired: state.ratings.requestMetadata[productId]?.status === "authExpired",
        disabled: getDisabled(),
    };
}

export default connect(mapStateToProps, {
    createOrUpdateRating, archiveRating, removeRatingFromProduct, addRatingToProduct
})(RatingIcon);