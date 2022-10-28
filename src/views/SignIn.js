import "react-native-get-random-values";
import { setupURLPolyfill } from 'react-native-url-polyfill';
setupURLPolyfill();

import React from 'react';
import { StyleSheet, Text } from "react-native";
import { connect } from "react-redux";

import AccountManagementPage from "../components/AccountManagementPage";
import InputSet from '../components/InputSet';
import { signIn, sendConfirmationCode } from "../features/account/accountSlice";
import { concatErrors } from "../../utils";


class SignIn extends React.Component {
    state = {
        email: null,
        customEmailError: null,
        password: null,
        customPasswordError: null,
    };

    validate = () => {
        let isValid = true;
        if (this.state.email === null || this.state.email === "") {
            this.setState({customEmailError: 'Email is required'});
            isValid = false;
        }

        if (this.state.password === null || this.state.password === "") {
            this.setState({customPasswordError: 'Password is required'});
            isValid = false;
        }
        return isValid;
    }

    navigateToSignUpPage = () => {
        this.props.navigation.navigate('Sign Up');
    }

    componentDidUpdate = (prevProps, prevState, snapshot) => {
        if(prevProps.requestStatus === 'loading' && this.props.requestStatus === 'succeeded'){
            if (!this.props.confirmed) {
                this.props.sendConfirmationCode();
                this.props.navigation.navigate('Confirm Account', { email: this.state.email });
            } else {
                const next = this.props.route.params?.next || 'Community Enrollment';
                const nextParams = this.props.route.params?.nextParams || {};
                this.props.navigation.navigate(next, nextParams);
            }
        }
    }

    renderCustomMessage = () => {
        let message = "";
        if (this.props.route !== undefined && this.props.route.params !== undefined) {
            message = this.props.route.params.customMessage;
        }

        if ( message !== "" ) {
            return <Text style={styles.message}>{ message }</Text>
        }
    }

    render() {
        return (
            <AccountManagementPage
                validate={() => this.validate()}
                formErrors={this.props.errors.form}
                onSubmit={() => this.props.signIn(this.state)}
                navigationDetails={{text: "Sign Up", action: () => this.navigateToSignUpPage()}}
                submitButtonText="Sign In"
                formName="Sign In"
                navigation={ this.props.navigation }
            >
                { this.renderCustomMessage() }
                <InputSet
                    label="Email"
                    errors={ concatErrors(this.props.errors.fields.email, this.state.customEmailError) }
                    onChangeText={(text) => {
                        this.setState({email: text})
                    }}
                    options={{
                        disabled:true,
                        keyboardType: "email-address",
                        textContentType: "emailAddress",
                        autoComplete: "email"
                    }}

                />
                <InputSet
                    label="Password"
                    errors={ concatErrors(this.props.errors.fields.password, this.state.customPasswordError) }
                    onChangeText={(text) => this.setState({password: text})}
                    options={{
                        secureTextEntry: true,
                        autoComplete: "password",
                        textContentType: "password",
                    }}
                />
            </AccountManagementPage>
        );
    }
}

const styles = StyleSheet.create({
    message: {
        fontFamily: "Helvetica Neue",
        fontSize: 18,
        lineHeight: 24,
        paddingBottom: 15,
        paddingLeft: 10,
        paddingRight: 10,
        textAlign: "center",
    }
})

const mapStateToProps = state => {
    return {
        errors: state.account.errors,
        requestStatus: state.account.requestStatus,
        confirmed: state.account.confirmed,
    };
};

export default connect(mapStateToProps, { signIn, sendConfirmationCode })(SignIn);