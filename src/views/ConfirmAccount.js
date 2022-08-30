import "react-native-get-random-values";
import { setupURLPolyfill } from 'react-native-url-polyfill';
setupURLPolyfill();

import React from "react";
import {connect} from "react-redux";
import { Text, StyleSheet } from "react-native";

import AccountManagementPage from "../components/AccountManagementPage";
import InputSet from "../components/InputSet";
import {confirm} from "../features/account/accountSlice";
import {concatErrors} from "../../utils";


class ConfirmAccount extends React.Component {
    state = {
        confirmationCode: null,
        confirmationCodeError: null
    };

    validate = () => {
        let isValid = true;
        this.setState({confirmationCodeError: null });
        if (this.state.confirmationCode === null) {
            this.setState({confirmationCodeError: 'Confirmation Code is required'});
            isValid = false;
        }

        return isValid;
    }

    componentDidUpdate(prevProps){
        if(prevProps.signUpStatus === 'loading' && this.props.signUpStatus === 'succeeded'){
            // navigate to community enrollment page
        }
    }

    render() {
        return (
            <AccountManagementPage
                validate={() => this.validate()}
                formErrors={this.props.errors.form}
                onSubmit={() => this.props.confirm({email: "24.daniel.long@gmail.com", confirmationCode: this.state.confirmationCode})}
                submitButtonText="Confirm Account"
                formName="Confirm Account"
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
    };
};

export default connect(mapStateToProps, { confirm })(ConfirmAccount);