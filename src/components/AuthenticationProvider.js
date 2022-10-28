import React, { useEffect } from 'react';
import { connect } from "react-redux";

import { expireSession, refreshSession } from "../features/account/accountSlice";
import { resetRequestStatuses as resetCommunities } from "../features/communities/communitiesSlice";
import { resetRequestStatuses as resetProducts } from "../features/products/productsSlice";
import { resetRequestStatuses as resetRatings } from "../features/ratings/ratingsSlice";


const AuthenticationProvider = props => {
    useEffect(() => {
        if (props.authExpired) {
            props.expireSession();
            props.resetCommunities();
            props.resetProducts();
            props.resetRatings();
        }
    }, [ props.authExpired ]);

    useEffect(() => {
        if (props.loggedIn === null) {
            props.refreshSession()
        }
        if (props.loggedIn === false) {
            const { index, routes } =  props.navigation.getState();
            if (routes[index].name !== "Sign In") {
                props.navigation.navigate('Sign In', {
                    next: routes[index].name,
                    nextParams: routes[index].params,
                    customMessage: 'Your session has expired, please sign in again.'
                });
            }
        }
    }, [ props.loggedIn ]);

    return <React.Fragment>{ props.children }</React.Fragment>
}

const mapStateToProps = state => {
    return {
        loggedIn: state.account.loggedIn
    }
}

export default connect(mapStateToProps, {
    expireSession, refreshSession, resetCommunities, resetProducts, resetRatings
})(AuthenticationProvider);
