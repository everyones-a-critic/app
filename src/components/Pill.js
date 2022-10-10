import React, { useState } from 'react';
import { Text, View, StyleSheet, Pressable } from "react-native";

const Pill = props => {
    const [selected, setSelected] = useState(props.startSelected);

    return (
        <Pressable
            style={[
                {
                    backgroundColor: selected ? props.primaryColor : 'transparent',
                    borderColor: props.primaryColor,
                },
                styles.pillContainer,
                props.style
            ]}>
            <Text style={[
                {
                    color: selected ? props.secondaryColor : props.primaryColor,
                    fontWeight: selected ? "500" : "300"
                },
                styles.pillText
            ]}>
                { props.title }
            </Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    pillContainer: {
        borderRadius: 12,
        borderWidth: 2,
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 16,
        paddingRight: 16,
        margin: 10
    },
    pillText: {
        fontFamily: "Helvetica Neue",
        fontSize: 16
    }
});

Pill.defaultProps = {
    style: {},
    primaryColor: "black",
    secondaryColor: "white",
    startSelected: false
};

export default Pill;