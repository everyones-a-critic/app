import React from 'react';
import { connect } from "react-redux";

import { signOut } from "../features/account/accountSlice";


class AuthenticationProvider extends React.Component {
    componentDidUpdate = () => {
        if (this.props.requestStatus === "expiredAuth") {
            this.props.signOut()

            const { index, routes } =  this.props.navigation.getState();
            this.props.navigation.navigate('Sign In', {
                next: routes[index].name,
                customMessage: 'Your session has expired, please sign in again.'
            });
        }
    }

    render = () => {
        return <React.Fragment>{ this.props.children }</React.Fragment>
    }
}

export default connect(null, { signOut })(AuthenticationProvider);
