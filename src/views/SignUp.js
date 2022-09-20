import "react-native-get-random-values";
import { setupURLPolyfill } from 'react-native-url-polyfill';
setupURLPolyfill();

import React from 'react';
import { connect } from 'react-redux';
import { signUp } from "../features/account/accountSlice";

import AccountManagementPage from "../components/AccountManagementPage";
import InputSet from '../components/InputSet';
import { concatErrors } from "../../utils";


class SignUp extends React.Component {
    state = {
        email: null,
        password: null,
        customPasswordError: null,
        customEmailError: null,
    };

    validate = () => {
        this.setState({customPasswordError: null, customEmailError: null})
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

    navigateToSignInPage = () => {
        this.props.navigation.navigate('Sign In');
    }

    componentDidUpdate(prevProps){
        if(prevProps.requestStatus === 'loading' && this.props.requestStatus === 'succeeded'){
            this.props.navigation.navigate('Confirm Account', { email: this.state.email });
        }
    }

    render() {
        return (
            <AccountManagementPage
                validate={() => this.validate()}
                formErrors={this.props.errors.form}
                onSubmit={() => this.props.signUp(this.state)}
                navigationDetails={{text: "Sign In", action: () => this.navigateToSignInPage()}}
                submitButtonText="Sign Up"
                formName="Sign Up"
                navigation={ this.props.navigation }
            >
                <InputSet
                    label="Email"
                    onChangeText={(text) => {
                        this.setState({email: text})
                    }}
                    errors={ concatErrors(this.props.errors.fields.email, this.state.customEmailError) }
                    options={{
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
                        autoComplete: "password-new",
                        textContentType: "newPassword",
                        passwordRules: "minlength: 8; required: lower; required: upper; required: digit; required: [-];",
                    }}
                />
            </AccountManagementPage>
        );
    }
}

const mapStateToProps = state => {
    return {
        errors: state.account.errors,
        requestStatus: state.account.requestStatus
    };
};

export default connect(mapStateToProps, { signUp })(SignUp);