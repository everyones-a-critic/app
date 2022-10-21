import React, { useState } from 'react';
import { Text, View, StyleSheet, Pressable } from "react-native";

const Pill = props => {
    const selected = props.selectedValue === props.value;

    return (
        <Pressable
            accessibilityRole="radio"
            accessibilityValue={{ text: props.value }}
            onPress = { () => {
                props.setSelectedValue(props.value)
            }}
            style={[
                {
                    backgroundColor: selected ? props.primaryColor : 'transparent',
                    borderColor: props.primaryColor,
                },
                styles.pillContainer,
                props.containerStyle
            ]}>
            <Text style={[
                {
                    color: selected ? props.secondaryColor : props.primaryColor,
                },
                styles.pillText,
                props.textStyle
            ]}>
                { props.title }
            </Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    pillContainer: {
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 16,
        paddingRight: 16,
        borderTopWidth: 2,
        borderBottomWidth: 2,
        borderLeftWidth: 1,
        borderRightWidth: 1,
    },
    pillText: {
        fontFamily: "Helvetica Neue",
        fontSize: 16,
        lineHeight: 18,
        fontWeight: "500",
    }
});

Pill.defaultProps = {
    containerStyle: {},
    primaryColor: "black",
    secondaryColor: "white",
    startSelected: false,
    textStyle: {}
};

export default Pill;