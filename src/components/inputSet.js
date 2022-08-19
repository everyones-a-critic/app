import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import { TouchableWithoutFeedback, View, TextInput, StyleSheet, Animated } from 'react-native';

import {selectInput} from "../actions";
import InputError from "./inputError";
import { GRAY, RED } from "../settings/colors";


const InputSet = ({label, onChange, options, selectedInput, selectInput, style, error}) => {
    const [fontSizeAnimation, setFontSizeAnimation] = useState(new Animated.Value(18));
    const [inputValue, setInputValue] = useState(null);
    const [isFocused, setIsFocused] = useState(false);
    const [errorText, setErrorText] = useState(error);
    const wrapperElement = useRef(null);
    const labelElement = useRef(null);
    const inputElement = useRef(null);
    const uid = crypto.randomUUID();

    useEffect(() => {
        if (error != null){
            setErrorText(error)
        }
    }, [ error ])

    const onWrapperPress = () => {
        selectInput(inputElement.current);
        shrinkLabel();
    };

    const animatedStyles = {
        fontSize: fontSizeAnimation
    }

    const shrinkLabel = () => {
        Animated.timing(fontSizeAnimation, {
            toValue: 14,
            duration: 35,
            useNativeDriver: false
        }).start(() => {
            inputElement.current.focus();
        });
    };

    const growLabel = () => {
        if (inputValue === null || inputValue === "") {
            Animated.timing(fontSizeAnimation, {
                toValue: 18,
                duration: 35,
                useNativeDriver: false
            }).start();
        }
    }

    const onInputChange = e => {
        setInputValue(e.nativeEvent.text)
        setErrorText(null);
        onChange(e);
    }

    const setDisplayStyle = () => {
        if (
            (selectedInput !== null && inputElement.current === selectedInput)
            || (inputValue !== null && inputValue !== "")
        ) {
            return { display: "flex" };
        } else {
            return { display: "none" };
        }
    }

    const inputBlur = () => {
        setIsFocused(false);
        growLabel();
        selectInput(null);
    }

    return (
        <View style={{width: '100%', alignItems: 'center'}}>
            <TouchableWithoutFeedback
                accessible={true}
                accessibilityHint={`Tap to select the ${label} input`}
                onPress={onWrapperPress}
            >
                <View
                    style={[
                        style,
                        styles.wrapper,
                        { borderColor: isFocused ? 'black' : errorText ? RED : GRAY }
                    ]}
                    ref={wrapperElement}
                >
                    <Animated.Text
                        style={[
                            styles.label,
                            animatedStyles,
                            { color: isFocused ? 'black' : errorText ? RED : GRAY }
                        ]}
                        ref={labelElement}
                        nativeID={uid}
                    >
                        {label}
                    </Animated.Text>
                    <TextInput
                        ref={inputElement}
                        style={{...styles.input, ...setDisplayStyle()}}
                        value={inputValue}
                        {...options }
                        onFocus={() => setIsFocused(true)}
                        onChange={(e) => onInputChange(e)}
                        onBlur={() => inputBlur()}
                        accessibilityLabel={`${label} Entry`}
                        accessibilityLabelledBy={uid}
                    />
                </View>
            </TouchableWithoutFeedback>
            <InputError error={errorText} inputLabel={label} />
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: 'white',
        fontFamily: 'Helvetica Neue',
        width: "80%",
        borderTopRightRadius: 4,
        borderTopLeftRadius: 4,
        borderBottomWidth: 2,
        borderColor: GRAY,
        height: 60,
        justifyContent: 'center'
    },
    label: {
        fontSize: 18,
        color: GRAY,
        paddingTop: 3,
        paddingBottom: 3,
        paddingLeft: 8,
        paddingRight: 8
    },
    input: {
        fontSize: 18,
        marginTop: 3,
        marginBottom: 5,
        marginLeft: 8,
        marginRight: 5,
    }
});

InputSet.defaultProps = {
    required: false
}

const mapStateToProps = (state) => {
  return { selectedInput: state.selectedInput };
}

export default connect(mapStateToProps, { selectInput })(InputSet);