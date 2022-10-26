import { Text, View, StyleSheet } from 'react-native';

const Field = ({ data, fieldMetadata, fallbackLabel, style }) => {
    const formatValue = (item, metadata) => {
        let enhancedValue = item[metadata.name];
        if (enhancedValue !== null & enhancedValue !== undefined) {
            if (Array.isArray(enhancedValue)) {
                let formattedString = "";
                enhancedValue.forEach(i => {
                    const formattedValue = formatValue({[metadata.name] : i}, metadata);
                    formattedString += `${formattedValue}, `;
                });
                enhancedValue = formattedString.slice(0, -2);
            } else {
                if (metadata.formatting === 'currency') {
                    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
                    enhancedValue = formatter.format(enhancedValue);
                    if (item.price_per) {
                        enhancedValue += ` for ${item.price_per}`;
                    }
                } else if (metadata.formatting === 'percentage') {
                    enhancedValue = `${enhancedValue * 100}%`;
                }
            }
        }

        return enhancedValue;
    }
    const renderLabel = labelStyles => {
        if (fieldMetadata.label) {
            return <Text style={[ styles.text, labelStyles, style ]}>{ fieldMetadata.label }:</Text>;
        } else if (fallbackLabel) {
            return <Text style={[ styles.text, labelStyles, style ]}>{ fallbackLabel }:</Text>;
        }
        return null;
    }

    const fieldValue = formatValue(data, fieldMetadata);
    if (fieldValue === '' || fieldValue === undefined || fieldValue === null) {
        return null;
    } else {
        let labelStyles;
        let wrapperStyles;
        if (fieldValue.length <= 20) {
            labelStyles = styles.label;
            wrapperStyles = styles.wrapper;
        } else {
            labelStyles = styles.fullWidthLabel;
            wrapperStyles = styles.overflowWrapper;
        }

        return (
            <View style={ wrapperStyles }>
                { renderLabel(labelStyles) }
                <Text
                    accessibilityLabel={ fieldMetadata.label || fallbackLabel }
                    accessibilityRole="text"
                    style={[ styles.value, styles.text, style ]}
                >
                    { fieldValue }
                </Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
        flexDirection: 'row',
        paddingTop: 2,
        paddingBottom: 2,
    },
    overflowWrapper: {
        width: "100%",
        paddingTop: 2,
        paddingBottom: 10,
    },
    label: {
        fontWeight: "400",
        paddingRight: 4,
    },
    fullWidthLabel: {
        fontWeight: "400",
        width: "100%",
        marginBottom: 5,
    },
    text: {
        fontFamily: 'Helvetica Neue',
        fontSize: 16,
        fontWeight: "300",
    },
    value: {
        flex: 1,
    }
});

Field.defaultProps = {
    fallbackLabel: null,
    style: {}
}

export default Field;