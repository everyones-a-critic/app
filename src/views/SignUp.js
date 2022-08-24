import "react-native-get-random-values";
import { setupURLPolyfill } from 'react-native-url-polyfill';
setupURLPolyfill();

import React from 'react';

import { CognitoIdentityProviderClient, SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { COGNITO_CLIENT_ID, COGNITO_USER_POOL_ID, COGNITO_REGION } from 'react-native-dotenv';

import AccountManagementPage from "../components/AccountManagementPage";
import InputSet from '../components/InputSet';


class SignUp extends React.Component {
    state = {
        email: null,
        password: null,
        passwordError: null,
        emailError: null,
        genericError: null
    };

    validate = () => {
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
                navigationDetails={{text: "Sign In", action: () => this.navigateToConfirmationPage()}}
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

export default SignUp;