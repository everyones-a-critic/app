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
        let delay = 0;
        if (this.props.contentOverlay) {
            delay = 750;
        }

        if (this.props.loading && this.timer === undefined) {
            this.timer = setTimeout(() => {
                this.ref.current.setNativeProps({ style: { display: 'flex' }});
                this.rotateSpinner();
            }, delay);
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

    renderContentCover = () => {
        if (this.props.contentOverlay) {
            return <View style={[ style.absolute, style.overlay ]} accessibilityLabel="Content Cover" />
        }
    }

    renderSpinner = () => {
        if (this.props.loading) {
            return (
                <React.Fragment>
                    { this.renderContentCover() }
                    <View style={[ style.absolute, style.spinnerContainer, { minHeight: this.props.minHeight} ]} accessibilityLabel="Loading">
                        <Animated.Text testID={"spinner"} ref={this.ref} style={[
                            { height: this.props.size, width: this.props.size },
                            { display: 'none'},
                            {transform: [{ rotate: this.spin }]}
                        ]}>
                            <FontAwesomeIcon style={{ transform: [{translateY: 2 }]}} size={ this.props.size } color={ this.props.color }  icon={faSpinner} />
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
    overlay: {
        zIndex: 1,
        backgroundColor: 'black',
        opacity: 0.4,
    },
    container: {
        zIndex: 0,
    }
});

Loader.defaultProps = {
    contentOverlay: true,
    color: 'black',
    size: 50,
    minHeight: 0
}

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