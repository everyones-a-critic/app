import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, Image, View } from "react-native";
import { connect } from "react-redux";

import RatingIcon from  "./RatingIcon";


const RatingBox = props => {
    const renderExplanation = () => {
        const explanations = {
            1: `Bad - really bad. These are the ${props.community.plural_name.toLowerCase()} you only try once.`,
            2: `Not good. If it were free and your other options limited, you might try this ${props.community.name.toLowerCase()} again, but you wouldn't be excited about it.`,
            3: `Uninteresting and forgettable. Most ${props.community.plural_name.toLowerCase()} you experience will fall into this category.`,
            4: 'Enjoyable and exciting. An experience you are likely to seek out again.',
            5: `A real treat. Reserved for your absolute favorite ${props.community.plural_name.toLowerCase()}. These are the ones that stick with you.`,
        }
        if (props.rating?.roundedRating !== null && props.rating?.roundedRating !== undefined) {
            return <Text style={ styles.explanation }>{ explanations[props.rating?.roundedRating] }</Text>;
        }
    }

    return (
        <View style={[ styles.outerContainer, props.style ]}>
            <View style={styles.iconContainer}
                accessibilityRole="radiogroup"
                accessibilityLabel="Your Rating"
                accessibilityLabel="Select an option to rate this product."
            >
                <RatingIcon
                    value={ 1 } currentRating={ props.rating } color={ `#${props.community.primary_color}` } icon={'face-sad-tear'}
                    navigation={ props.navigation }
                    onRemoveRating={ () => props.onRemoveRating() }
                    onAddRating={ () => props.onAddRating() }
                    bottomSheetVisible={ props.bottomSheetVisible }
                />
                <RatingIcon
                    value={ 2 } currentRating={ props.rating } color={ `#${props.community.primary_color}` } icon={'face-frown'}
                    navigation={ props.navigation }
                    onRemoveRating={ () => props.onRemoveRating() }
                    onAddRating={ () => props.onAddRating() }
                    bottomSheetVisible={ props.bottomSheetVisible }
                />
                <RatingIcon
                    value={ 3 } currentRating={ props.rating } color={ `#${props.community.primary_color}` } icon={'face-meh'}
                    navigation={ props.navigation }
                    onRemoveRating={ () => props.onRemoveRating() }
                    onAddRating={ () => props.onAddRating() }
                    bottomSheetVisible={ props.bottomSheetVisible }
                />
                <RatingIcon
                    value={ 4 } currentRating={ props.rating } color={ `#${props.community.primary_color}` } icon={'face-smile'}
                    navigation={ props.navigation }
                    onRemoveRating={ () => props.onRemoveRating() }
                    onAddRating={ () => props.onAddRating() }
                    bottomSheetVisible={ props.bottomSheetVisible }
                />
                <RatingIcon
                    value={ 5 } currentRating={ props.rating } color={ `#${props.community.primary_color}` } icon={'face-grin-hearts'}
                    navigation={ props.navigation }
                    onRemoveRating={ () => props.onRemoveRating() }
                    onAddRating={ () => props.onAddRating() }
                    bottomSheetVisible={ props.bottomSheetVisible }
                />
            </View>
            { renderExplanation () }
        </View>
    )
};

const styles = StyleSheet.create({
    explanation: {
        fontFamily: 'Helvetica Neue',
        fontSize: 14,
        fontStyle: 'italic',
        marginTop: 10,
        textAlign: 'center'
    },
    outerContainer: {
    },
    iconContainer: {
        width: "100%",
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    }
});

const mapStateToProps = state => {
    const productId = state.products.focusedProduct?.id;

    return {
        rating: state.ratings.mostRecentRatings[productId],
    }
}

export default connect(mapStateToProps, {})(RatingBox);