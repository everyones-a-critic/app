import "react-native-get-random-values";
import { setupURLPolyfill } from 'react-native-url-polyfill';
setupURLPolyfill();

import React from 'react';
import {
    StyleSheet, KeyboardAvoidingView, ScrollView, View, Pressable, Text, Image, Keyboard, Platform
} from 'react-native';

import Loader from '../components/Loader';
import InputError from "../components/InputError";
import { YELLOW } from "../settings/colors";

class AccountManagementPage extends React.Component {
    state = {
        submitDisabled: false,
        webRequestInProgress: false,
    };

    validate = () => {
        return this.props.validate();
    }

    postSubmitProcessing = () => {
        this.setState({ submitDisabled: false });
        this.setState({ webRequestInProgress: false });
    }

    onSubmit = async e =>  {
        Keyboard.dismiss();
        this.setState({ submitDisabled: true })
        this.setState({ webRequestInProgress: true })
        if (this.validate()) {
            await this.props.onSubmit(e);
            this.postSubmitProcessing();
        } else {
            this.postSubmitProcessing();
        }
    }

    render() {
        return (
            <Loader loading={ this.state.webRequestInProgress }>
                <KeyboardAvoidingView
                    behavior={ Platform.OS === "ios" ? "padding" : "height" }
                    style={{ flex: 1 }}
                >
                    <ScrollView keyboardShouldPersistTaps={ 'handled' } contentContainerStyle={ styles.container }>
                        <Image style={[styles.image, styles.flexbox]} source={require('../../assets/horizontalLogo.png')} />
                        <View style={[styles.flexbox, { minHeight: 200, flexShrink: 0, flexGrow: 1, justifyContent: 'space-evenly'}]}>
                            { this.props.children }
                            <InputError error={this.props.formError} inputLabel={`${this.props.formName} Form`} />
                        </View>
                        <View style={[styles.flexbox, { flexBasis: 120, flexShrink: 4, flexGrow: 4 }]}>
                            <Pressable
                                disabled={this.state.submitDisabled}
                                accessibilityRole="button"
                                accessibilityState={{
                                    disabled: this.state.submitDisabled,
                                    busy: this.state.submitDisabled
                                }}
                                accessibilityLabel={`Submit ${this.props.formName} Form`}
                                style={{ width: "80%", marginTop: 25 }}
                                onPress={(e) => this.onSubmit(e) }
                            >
                                <View style={styles.button}>
                                    <Text style={styles.buttonText}>{this.props.submitButtonText}</Text>
                                </View>
                            </Pressable>
                            <Pressable onPress={ () => { this.props.onSuccess() }}>
                                <Text style={styles.link}>Sign In</Text>
                            </Pressable>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Loader>
        );
    }
}

const styles = StyleSheet.create({
    flexbox: {
        flex: 1,
        alignItems: 'center',
        width: '100%',
    },
    container: {
        minHeight: "100%",
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: YELLOW,
        fontFamily: 'Helvetica Neue',
    },
    image: {
        resizeMode: 'contain',
        minHeight: 160,
    },
    button: {
        alignItems: 'center',
        backgroundColor: 'black',
        padding: 15,
        borderRadius: 5,
        height: 50
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    link: {
        fontWeight: "700",
        fontSize: 16,
        textDecorationLine: 'underline',
        marginTop: 15,
        marginBottom: 30
    },
    errorContainer: {
        width: "90%",
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#F5C6CA',
        backgroundColor: '#F8D7D9',
        overflowWrap: 'break-word'
    },
    error: {
        fontSize: 14,
        color: '#721C23',
    }
});

export default AccountManagementPage;