import { Text, View, StyleSheet } from 'react-native';

const Field = ({ data, fieldMetadata }) => {
    const formatValue = (item, metadata) => {
        let enhancedValue = item[metadata.name];
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
            }
        }

        return enhancedValue;
    }
    const renderLabel = () => {
        if (fieldMetadata.label) {
            return <Text style={[ styles.text, styles.label ]}>{ fieldMetadata.label }:</Text>
        }
        return null;
    }

    return (
        <View style={ styles.wrapper }>
            { renderLabel() }
            <Text style={[ styles.value, styles.text ]}>{ formatValue(data, fieldMetadata) }</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
        flexDirection: 'row',
        paddingTop: 2,
        paddingBottom: 2,
    },
    label: {
        fontWeight: "400",
        paddingRight: 4,
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

export default Field;