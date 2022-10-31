import "react-native-get-random-values";
import { setupURLPolyfill } from 'react-native-url-polyfill';
setupURLPolyfill();

import React from 'react';
import {
    StyleSheet, KeyboardAvoidingView, ScrollView, View, Pressable, Text, Image, Keyboard, Platform,
    Dimensions, StatusBar
} from 'react-native';
import { SafeAreaProvider, SafeAreaInsetsContext } from 'react-native-safe-area-context';

import {resetErrors, signUp} from "../features/account/accountSlice";
import Loader from '../components/Loader';
import InputError from "../components/InputError";
import { YELLOW } from "../settings/colors";
import {connect} from "react-redux";

const window = Dimensions.get("window");
const screen = Dimensions.get("screen");


class AccountManagementPage extends React.Component {
    state = {
        submitDisabled: false,
        webRequestInProgress: false,
        dimensions: { window, screen },
        keyboardVisible: false
    };

    onChange = ({ window, screen }) => {
        console.log("onChange called")
        this.setState({ dimensions: { window, screen } });
    };

    componentDidMount() {
        this.dimensionsSubscription = Dimensions.addEventListener("change", this.onChange);
        this.keyboardDidShowSubscription = Keyboard.addListener('keyboardDidShow', () => {
            this.setState({ keyboardVisible: true });
        });

        this.keyboardDidHideSubscription = Keyboard.addListener('keyboardDidHide',() => {
            this.setState({ keyboardVisible: false });
        });
    }

    componentDidMount =() => {
        if (this.props.navigation !== undefined) {
            this.props.navigation.addListener('blur', () => {
                this.postSubmitProcessing();
            });
        }
    }

    componentWillUnmount() {
        this.dimensionsSubscription?.remove();
        this.keyboardDidShowSubscription?.remove()
        this.keyboardDidHideSubscription?.remove()
        this.postSubmitProcessing();
    }

    validate = () => {
        this.props.resetErrors();
        return this.props.validate();
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

    postSubmitProcessing = () => {
        this.setState({ submitDisabled: false });
        this.setState({ webRequestInProgress: false });
    }

    renderNavigationLink = () => {
        if (this.props.navigationDetails !== undefined) {
            return (
                <Pressable
                    onPress={() => this.props.navigationDetails.action()}
                    accessibilityRole='link'
                    accessibilityHint={`Navigate to ${this.props.navigationDetails.text} page`}
                >
                    <Text style={styles.link}>{ this.props.navigationDetails.text }</Text>
                </Pressable>

            );
        } else {
            return null;
        }
    }

    renderFormErrors = () => {
        const errorComponents = this.props.formErrors.map((error, index) => {
	        return (
                <InputError
                    key={`${this.props.formName}-${index}`}
                    error={error}
                    inputLabel={`${this.props.formName} Form`}
                />
            );
        });

        return (
            <React.Fragment>
                { errorComponents }
            </React.Fragment>
        )
    }

    render() {
        return (
            <SafeAreaProvider>
                <SafeAreaInsetsContext.Consumer>
                    { insets => <Loader loading={ this.state.webRequestInProgress }>
                        <KeyboardAvoidingView
                            behavior={ Platform.OS === "ios" ? "padding" : "height" }
                            style={{ flex: 1, backgroundColor: YELLOW }}
                        >
                            <View style={{ height: insets.top, backgroundColor: YELLOW }}>
                                <StatusBar hidden={false} backgroundColor={ YELLOW } barStyle={ 'dark-content' } />
                            </View>
                            <ScrollView keyboardShouldPersistTaps={ 'handled' } contentContainerStyle={ styles.container }>
                                <Image style={[styles.image, styles.flexbox]} source={require('../../assets/horizontalLogo.png')} />
                                <View style={[
                                    styles.flexbox,
                                    { minHeight: 200, flexShrink: 0, flexGrow: 1, justifyContent: 'space-evenly'}
                                ]}>
                                    { this.props.children }
                                    { this.renderFormErrors() }
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
                                    { this.renderNavigationLink() }
                                </View>
                            </ScrollView>
                        </KeyboardAvoidingView>
                    </Loader> }
                </SafeAreaInsetsContext.Consumer>
            </SafeAreaProvider>
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
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: YELLOW,
        fontFamily: 'Helvetica Neue',
        paddingBottom: 35,
        flex: 1,
        minHeight: 500
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
        height: 50,
        marginBottom: 15
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    link: {
        fontWeight: "700",
        fontSize: 16,
        textDecorationLine: 'underline',
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

const mapStateToProps = state => {
    return {
        loading: state.account.requestStatus === 'loading'
    };
};

export default connect(mapStateToProps, { resetErrors })(AccountManagementPage);