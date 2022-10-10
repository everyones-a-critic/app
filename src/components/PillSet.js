import React, { useState } from 'react';
import { Text, View, StyleSheet, Pressable, ScrollView } from "react-native";

const PillSet = props => {
    return (
        <ScrollView
            showsHorizontalScrollIndicator={ false }
            horizontal={ true }
            contentContainerStyle={[ styles.pillSetContainer, props.style ]}>
                { props.children }
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    pillSetContainer: {
        alignItems: 'center',
    }
});

PillSet.defaultProps = {
    style: {}
}

export default PillSet;