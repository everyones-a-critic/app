import React from 'react';
import {StyleSheet, Text, View} from "react-native";

import { RED, PINK } from "../settings/colors";

class InputError extends React.Component {
    render() {
        const error = this.props.error
        if (!(error === null || error === undefined || error === "")) {
            return (
                <View style={styles.errorContainer}>
                    <Text
                        accessibilityRole="alert"
                        accessibilityLabel={`Error for ${this.props.inputLabel} input`}
                        style={styles.error}
                    >
                        {error}
                    </Text>
                </View>
            );
        } else {
            return null;
        }
    }
}

const styles = StyleSheet.create({
    errorContainer: {
        width: "75%",
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#F5C6CA',
        backgroundColor: PINK,
        overflowWrap: 'break-word',
        margin: 5
    },
    error: {
        fontSize: 14,
        color: RED,
        padding: 3
    }
});

export default InputError;