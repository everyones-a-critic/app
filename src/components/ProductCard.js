import React, { useState, memo } from 'react';
import { Text, View, StyleSheet, Pressable, Image } from "react-native";
import Field from "../components/Field";
import FieldSet from "../components/FieldSet";

const ProductCard = ({ product, fields, navigation }) => {
    const navigateToProductPage = () => {
        navigation.navigate('Product Home', {
            productId: product.id,
            communityId: product.community_id
        });
    }

    return (
        <View style={{ width: 300, marginBottom: 30, alignItems: 'center' }}>
            <Pressable
                accessibilityRole="link"
                accessibilityLabel={ `Open ${product.name} page` }
                accessibilityHint={ `Navigate to the ${product.name} page` }
                onPress={ navigateToProductPage }
                style={[styles.image, styles.imageWrapper ]}
            >
                <Image
                    accessibilityLabel={`Image of ${product.name}`}
                    style={ styles.image }
                    source={{ uri: product.image_url }} />
            </Pressable>
            <Pressable
                accessibilityRole="link"
                accessibilityLabel={ `Open ${product.name} page` }
                accessibilityHint={ `Navigate to the ${product.name} page` }
                onPress={ navigateToProductPage }
                style={ styles.content }
            >
                <View
                    style={ styles.headerWrapper }>
                    <Text style={[ styles.text, styles.brandText ]} numberOfLines={1}>{ product.brand }</Text>
                    <Text
                        accessibilityRole="header"
                        accessibilityLabel="Product Header"
                        style={[ styles.text, styles.headerText ]}
                        numberOfLines={1}
                    >
                            { product.name }
                    </Text>
                </View>
                <FieldSet fields={ fields } data={ product } />
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    imageWrapper: {
        backgroundColor: 'white',
        marginBottom: 10,
    },
    image: {
        height: 300,
        width: 300,
        borderRadius: 10,
    },
    text: {
        fontFamily: 'Helvetica Neue',
        paddingTop: 2,
        paddingBottom: 2,
        fontSize: 16,
        fontWeight: "300",
    },
    headerWrapper: {
        width: "100%",
        flexDirection: "row",
    },
    brandText: {
        fontWeight: "600",
        paddingRight: 5,
    },
    headerText: {
        flex: 1,
    },
    content: {
       width: "100%",
    },
    contentText: {}
});

export default memo(ProductCard);