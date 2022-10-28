import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, Image, View, TextInput, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { connect } from "react-redux";
import { LIGHTGRAY } from "../settings/colors";

import PillBox from  "../components/PillBox";
import AuthenticationProvider from  "../components/AuthenticationProvider";
import { updateRating } from "../features/ratings/ratingsSlice";
import uuid from 'react-native-uuid';

let timer;
const EditRating = props => {
    const [ adjustment, setAdjustment ] = useState(null);
    const [ comments, setComments ] = useState(null);
    const [ patchData, setPatchData ] = useState(null);

    const primaryColor = `#${props.community?.primary_color}`;
    const secondaryColor= `#${props.community?.secondary_color}`;

    useEffect(() => {
        if (props.rating !== undefined && props.rating !== null) {
            setAdjustment(Math.round((props.rating.rating - props.rating.roundedRating) * 100) / 100);
            setComments(props.rating.comments);
        }
    }, [props.rating?.rating]);

    useEffect(() => {
        if (props.rating !== undefined && props.rating !== null && adjustment != null) {
            const rating = Math.round((props.rating.roundedRating + adjustment) * 100) / 100;
            if (rating !== props.rating.rating) {
                props.updateRating({
                    productId: props.focusedProductId,
                    ratingId: props.rating.id,
                    data: { rating }
                });
            }
        }
    }, [adjustment]);

    // using two useEffects to debounce the api for comments patch
    useEffect(() => {
        if (comments !== null && comments !== '' && props.rating !== undefined && props.rating !== null) {
            window.clearTimeout(timer);
            timer = window.setTimeout(() => {
                if (comments !== '' && comments !== null) {
                    const patchData = { comments: comments };
                    setPatchData(patchData);
                }
            }, 500);
        }

        return () => {
            window.clearTimeout(timer);
        }
    }, [comments]);

    useEffect(() => {
        if (
            patchData !== null && props.rating !== undefined && props.rating !== null &&
            patchData?.comments !== undefined && patchData?.comments !== props.rating.comments &&
            props.requestStatus !== 'loading'
        ) {
            props.updateRating({
                productId: props.focusedProductId,
                ratingId: props.rating.id,
                data: patchData,
            });
        }
    }, [patchData, props.requestStatus]);

    return (
        <AuthenticationProvider authExpired={ props.authExpired } navigation={ props.navigation }>
            <View style={{ flex: 1 }}>
                <Text accessibilityRole="header" style={[styles.bottomSheetHeader, { color: `#${props.community.secondary_color}` }]}>
                    Your Review
                </Text>
                <KeyboardAvoidingView
                    behavior={ Platform.OS === "ios" ? "padding" : "height" }
                    style={{ flex: 1 }}
                >
                    <ScrollView style={ styles.contentContainer } contentContainerStyle={[ styles.contentContainerContainerStyle ]}>
                        <View style={ styles.ratingContainer }>
                            <Text style={[ styles.text, styles.label ]}>Your Rating: </Text>
                            <Text accessibilityRole="text" accessibilityLabel="Your Rating" style={ styles.text }>{ props.rating?.roundedRating }</Text>
                        </View>
                        <Text nativeId="comparisonLabel" style={[ styles.text, styles.label ]} >
                            How does this { props.community.name.toLowerCase() } compare to other { props.community.plural_name.toLowerCase() } you've
                            rated a { props.rating?.roundedRating }?
                        </Text>
                        <View style={ styles.pillBoxContainer }>
                            <PillBox
                                accessibilityLabelledBy="comparisonLabel"
                                navigation={ props.navigation }
                                style={ styles.pillContainer }
                                pills={[
                                    { value: -0.66, label: "Worse" },
                                    { value: -0.33, label: "About the Same" },
                                    { value: 0, label: "Better" }
                                ]}
                                primaryColor={ primaryColor }
                                secondaryColor={ secondaryColor }
                                selected={ adjustment }
                                onChange={ value => setAdjustment(value) }
                            />
                        </View>
                        <Text style={[ styles.text, styles.label ]}>Comments</Text>
                        <Text style={[ styles.text, styles.secondaryLabel ]}>(optional)</Text>
                        <TextInput
                            accessibilityLabel="Comments"
                            accessibilityHint="Enter any notes or thoughts here."
                            onFocus={ () => props.bottomSheetRef.current.snapToIndex(1) }
                            value={ comments }
                            onChangeText={ text => setComments(text) }
                            style={ styles.textArea } multiline={ true } />
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </AuthenticationProvider>
    )
};

const styles = StyleSheet.create({
    bottomSheetHeader: {
        fontFamily: 'Helvetica Neue',
        fontSize: 20,
        textAlign: 'center',
        fontWeight: "500",
        paddingBottom: 10,
    },
    contentContainer: {
        backgroundColor: 'white',
        flex: 1,

    },
    contentContainerContainerStyle: {
        paddingTop: 25,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 150,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingBottom: 20,
    },
    text: {
        fontFamily: 'Helvetica Neue',
        fontSize: 18,
        lineHeight: 20,
    },
    label: {
        fontWeight: "500"
    },
    secondaryLabel: {
        fontSize: 16,
        fontStyle: 'italic',
    },
    pillBoxContainer: {
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 20,
    },
    pillContainer: {
    },
    textArea: {
        marginTop: 5,
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 10,
        paddingRight: 10,
        fontSize: 16,
        borderWidth: 1,
        borderColor: LIGHTGRAY,
        height: 150,

    }
});

const mapStateToProps = state => {
    const productId = state.products.focusedProduct?.id

    return {
        focusedProductId: productId,
        rating: state.ratings.mostRecentRatings[productId],
        requestStatus: state.ratings.requestMetadata[productId]?.status,
        authExpired: state.ratings.requestMetadata[productId]?.status === "authExpired"
    }
}

export default connect(mapStateToProps, { updateRating })(EditRating);