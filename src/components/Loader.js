import React from "react";
import { View, Animated, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner'


class Loader extends React.Component {
    state = {
        spinValue: new Animated.Value(0),
    };

    ref = React.createRef();

    rotateSpinner = () => {
        Animated.loop(
            Animated.timing(this.state.spinValue, {
                toValue: 1,
                duration: 1200,
                useNativeDriver: false  // To make use of native driver for performance
            })
        ).start();
    }

    spin = this.state.spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    initiateSpinner = () => {
        if (this.props.loading && this.timer === undefined) {
            this.timer = setTimeout(() => {
                this.ref.current.setNativeProps({ style: { display: 'flex' }});
                this.rotateSpinner();
            }, 750);
        }
    }

    componentDidMount = () => {
        this.initiateSpinner();
    }

    componentDidUpdate = (prevProps) => {
        this.initiateSpinner();
        if (prevProps.loading && !this.props.loading) {
            clearTimeout(this.timer);
        }
    }

    componentWillUnmount = () => {
        clearTimeout(this.timer);
    }

    renderSpinner = () => {
        if (this.props.loading) {
            return (
                <React.Fragment>
                    <View style={[ style.absolute, style.overlay ]} accessibilityLabel="Content Cover" />
                    <View style={[ style.absolute, style.spinnerContainer ]} accessibilityLabel="Loading">
                        <Animated.Text testID={"spinner"} ref={this.ref} style={[
                            style.spinner,
                            { display: 'none'},
                            {transform: [{ rotate: this.spin }]}
                        ]}>
                            <FontAwesomeIcon size={ 50 } color={'black'}  icon={faSpinner} />
                        </Animated.Text>
                    </View>
                </React.Fragment>
            )
        }
    }

    render = () => {
        return (
            <View style={{ flex: 1}}>
                { this.renderSpinner() }
                <View style={[ style.absolute, style.container ]}>
                    { this.props.children }
                </View>
            </View>
        );
    }
}

const style = StyleSheet.create({
    absolute: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
    },
    spinnerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2
    },
    spinner: {
        width: 50,
        height: 45,
    },
    overlay: {
        zIndex: 1,
        backgroundColor: 'black',
        opacity: 0.4,
    },
    container: {
        zIndex: 0,
    }
});

export default Loader;

// on render, if props.loading == false
//    do nothing
// else
//    render background
//    if spinnerVisible = true
//        render Spinner
//        start spinning
//    else
//        750m timeout set spinnerVisible = true