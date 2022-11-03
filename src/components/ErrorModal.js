import React, { useState, useEffect } from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";

export default ({ errors }) => {
    const [ visible, setVisible ] = useState(false);

    useEffect(() => {
		if (errors !== undefined && errors.length > 0) {
            setVisible(true);
        } else {
            setVisible(false);
        }
    }, [errors]);

    const renderErrorText = () => {
        if (errors.length === 1) {
            return <Text accessibilityRole="alert" style={[ styles.text, styles.errorText ]}>{ errors[0] }</Text>
        } else {
            let i = 0;
            const errorTextBlocks = errors.map(error => {
                i++;
                return (
                    <Text
                        key={i}
                        style={[ styles.text, styles.errorText ]}
                        accessibilityRole="alert"
                    >
                        {`\u2022 ${error}`}
                    </Text>
                )
            });
            return <React.Fragment>{ errorTextBlocks }</React.Fragment>
        }
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <View style={ styles.modalHeader }>
                        <Text style={[styles.text, styles.modalHeaderText ]}>An error has occurred</Text>
                    </View>
                    <View style={ styles.modalBody }>
                        { renderErrorText() }
                    </View>
                    <View style={ styles.modalFooter }>
                        <Pressable
                            style={[ styles.button, styles.buttonClose ]}
                            onPress={() => setVisible(false)}
                        >
                            <Text style={[styles.text, styles.buttonText]}>Dismiss</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalView: {
        width: "90%",
        marginLeft: "5%",
        marginRight: "5%",
        marginTop: 100,
        backgroundColor: "white",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#C8C8C8",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalHeader: {
        padding: 20,
        width: "100%",
        borderBottomWidth: 1,
        borderColor: "#C8C8C8"
    },
    modalBody: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
        borderBottomWidth: 1,
        borderColor: "#C8C8C8",
    },
    modalFooter: {
        alignItems: "flex-end",
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
    },
    button: {
        borderRadius: 5,
        elevation: 2,
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
    },
    buttonClose: {
        backgroundColor: "red",
    },
    text: {
        fontFamily: "Helvetica Neue",
        textAlign: "left",
        fontSize: 18,
    },
    errorText: {
        marginTop: 10,
        marginBottom: 10,
    },
    modalHeaderText: {
        fontSize: 18,
        fontWeight: "500",
        textAlign: "left",
    },
    buttonText: {
        color: 'white'
    }
});