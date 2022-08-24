import "react-native-get-random-values";
import { setupURLPolyfill } from 'react-native-url-polyfill';
setupURLPolyfill();

import React from 'react';
import {
    StyleSheet, KeyboardAvoidingView, ScrollView, View, Pressable, Text, Image, Keyboard, Platform
} from 'react-native';

import { CognitoIdentityProviderClient, SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { COGNITO_CLIENT_ID, COGNITO_USER_POOL_ID, COGNITO_REGION } from 'react-native-dotenv';

import AccountManagementPage from "../components/AccountManagementPage";
import InputSet from '../components/InputSet';
import Loader from '../components/Loader';
import InputError from "../components/InputError";
import { YELLOW } from "../settings/colors";

class SignUp extends React.Component {
    state = {
        email: null,
        password: null,
        passwordError: null,
        emailError: null,
        submitDisabled: false,
        webRequestInProgress: false,
        genericError: null
    };

    validate = () => {
        Keyboard.dismiss();
        let isValid = true;
        if (this.state.email === null) {
            this.setState({emailError: 'Email is required'});
            isValid = false;
        }

        if (this.state.password === null) {
            this.setState({passwordError: 'Password is required'});
            isValid = false;
        }
        return isValid;
    }

    async attemptSignUp() {
        const input = {
            ClientId: COGNITO_CLIENT_ID,
            UserPoolId: COGNITO_USER_POOL_ID,
            Password: this.state.password,
            Username: this.state.email,
            UserAttributes: [{
                Name: "email",
                Value: this.state.email
            }],
        }

        const client = new CognitoIdentityProviderClient({
            region: COGNITO_REGION,
        });

        const command = new SignUpCommand(input);
        try {
            await client.send(command);
            this.props.navigation.navigate('Confirm Account', { email: this.state.email });
        } catch(e) {
            switch (e.name) {
                case 'InvalidPasswordException':
                    this.setState({ passwordError: e.message });
                    break;
                case 'UsernameExistsException':
                    this.setState({ genericError:
                        'A user is already registered with that email address. Please sign in.'
                    });
                    break;
                default:
                    this.setState({ genericError: e.message });
            }
        }
    }

    navigateToConfirmationPage = () => {
        // TODO : Add Sign In Navigation
    }

    render() {
        return (
            <AccountManagementPage
                validate={() => this.validate()}
                formError={this.state.genericError}
                onSubmit={() => this.attemptSignUp()}
                onSuccess={() => this.navigateToConfirmationPage()}
                submitButtonText="Sign Up"
                formName="Sign Up"
            >
                <InputSet
                    label="Email"
                    onChangeText={(text) => {
                        this.setState({email: text})
                    }}
                    error={this.state.emailError}
                    options={{
                        keyboardType: "email-address",
                        textContentType: "emailAddress",
                        autoComplete: "email"
                    }}

                />
                <InputSet
                    style={styles.input}
                    label="Password"
                    error={this.state.passwordError}
                    onChangeText={(text) => this.setState({password: text})}
                    options={{
                        secureTextEntry: true,
                        autoComplete: "password-new",
                        textContentType: "newPassword",
                        passwordRules: "minlength: 8; required: lower; required: upper; required: digit; required: [-];",
                    }}
                />
            </AccountManagementPage>
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
        margin: 15
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

export default SignUp;