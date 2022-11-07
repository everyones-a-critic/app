import "react-native-get-random-values";
import { setupURLPolyfill } from 'react-native-url-polyfill';
setupURLPolyfill();

import React from "react";
import { connect } from "react-redux";
import { Text, StyleSheet } from "react-native";

import AccountManagementPage from "../components/AccountManagementPage";
import InputSet from "../components/InputSet";
import { confirm } from "../features/account/accountSlice";
import { concatErrors } from "../../utils";


class ConfirmAccount extends React.Component {
    state = {
        confirmationCode: null,
        confirmationCodeError: null
    };

    validate = () => {
        let isValid = true;
        this.setState({ confirmationCodeError: null });
        if (this.state.confirmationCode === null) {
            this.setState({ confirmationCodeError: 'Confirmation Code is required' });
            isValid = false;
        }

        return isValid;
    }

    componentDidUpdate(prevProps){
        if(prevProps.requestStatus === 'loading' && this.props.requestStatus === 'succeeded'){
            this.props.navigation.navigate(
                'Sign In',
                {
                    customMessage:  "Your email has been verified. Welcome to Everyone's a Critic! Please sign in to " +
                                    "get started."
                }
            );
        }
    }

    tryConfirmation = () => {
        return this.props.confirm({
            email: this.props.route.params.email,
            confirmationCode: this.state.confirmationCode
        });
    }

    navigateToSignInPage = () => {
        this.props.navigation.navigate('Sign In', { email: this.props.route.params.email });
    }

    render() {
        return (
            <AccountManagementPage
                validate={ () => this.validate() }
                formErrors={ this.props.errors.form }
                onSubmit={ () => this.tryConfirmation() }
                submitButtonText="Confirm Account"
                formName="Confirm Account"
                navigationDetails={{ text: "Back", action: () => this.navigateToSignInPage() }}
                navigation={ this.props.navigation }
            >
                <Text style={[ styles.header, styles.text ]}>Check your Email</Text>
                <Text style={[ styles.message, styles.text ]}>
                    A confirmation code was sent to the email address you provided. Enter this code below to confirm
                    your account.
                </Text>
                <InputSet
                    label="Confirmation Code"
                    onChangeText={(text) => {
                        this.setState({confirmationCode: text})
                    }}
                    errors={ concatErrors(this.props.errors.fields.confirmationCode, this.state.confirmationCodeError) }
                    options={{
                        keyboardType: "number-pad",
                        textContentType: "oneTimeCode",
                        autoComplete: "sms-otp",
                        maxLength: 6
                    }}
                />
            </AccountManagementPage>
        );
    }
}

const styles = StyleSheet.create({
    text: {
        fontFamily: 'Helvetica Neue',
        width: "80%",
        textAlign: 'center'
    },
    header: {
        fontSize: 24,
        fontWeight: "800"
    },
    message: {
        fontSize: 16,
        lineHeight: 24,
        paddingTop: 15,
        paddingBottom: 25
    }
});

const mapStateToProps = state => {
    return {
        errors: state.account.errors,
        requestStatus: state.account.requestStatus['confirm']
    };
};

export default connect(mapStateToProps, { confirm })(ConfirmAccount);