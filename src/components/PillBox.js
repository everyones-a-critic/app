import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Pressable, ScrollView } from "react-native";

import Pill from  "./Pill";

const PillBox = props => {
    const[selectedValue, setSelectedValue] = useState(props.selected);

    useEffect( () => {
        setSelectedValue(props.selected);
    }, [props.selected]);

    useEffect(() => {
        if (props.onChange !== undefined) {
            props.onChange(selectedValue);
        }
    }, [selectedValue]);

    const renderPills = () => {
        let i = 1;
        const pillElements = props.pills.map(pill => {
            let containerStyle = {};
            if (i === 1) {
                containerStyle = {
                    borderTopLeftRadius: 10,
                    borderBottomLeftRadius: 10,
                    borderLeftWidth: 2,
                }
            } else if (i == props.pills.length) {
                containerStyle = {
                    borderTopRightRadius: 10,
                    borderBottomRightRadius: 10,
                    borderRightWidth: 2,
                }
            }
            i++;

            return (
                <Pill
                    key={ pill.value }
                    selectedValue={ selectedValue }
                    setSelectedValue={ setSelectedValue }
                    title={ pill.label || pill.value }
                    value= { pill.value }
                    primaryColor={ props.primaryColor }
                    secondaryColor={ props.secondaryColor }
                    containerStyle={[ containerStyle, props.pillContainerStyle ] }/>
            );
        });

        return <React.Fragment>{ pillElements }</React.Fragment>;
    };

    if (props.scrollable) {
        return (
            <ScrollView
                accessibilityLabel= { props.accessibilityLabel }
                accessibilityLabelledBy= { props.accessibilityLabelledBy }
                accessibilityRole="radiogroup"
                showsHorizontalScrollIndicator={ false }
                horizontal={ true }
                contentContainerStyle={[ styles.pillSetContainer, props.style ]}>
                    { renderPills() }
            </ScrollView>
        );
    } else {
        return (
            <View
                accessibilityLabel= { props.accessibilityLabel }
                accessibilityRole="radiogroup"
                style={[ styles.pillSetContainer, props.style ]}
            >{ renderPills() }</View>
        );
    }
}

const styles = StyleSheet.create({
    pillSetContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        borderRadius: 5,
    }
});

PillBox.defaultProps = {
    style: {},
    pillContainerStyle: {}
}

export default PillBox;