import React, { useState, useRef, useEffect, useContext } from 'react';
import { Pressable, View, TextInput, StyleSheet, Animated } from 'react-native';
import uuid from 'react-native-uuid';

import { FocusedElementContext } from "../context/focusedElement";
import InputError from "./InputError";
import { GRAY, RED } from "../settings/colors";


const InputSet = ({label, options, style, errors, onChangeText}) => {
    const { focusedElement, setFocusedElement } = useContext(FocusedElementContext);
    const [fontSizeAnimation, setFontSizeAnimation] = useState(new Animated.Value(18));
    const [inputValue, setInputValue] = useState(null);
    const [errorList, setErrorList] = useState(errors);

    const wrapperElement = useRef(null);
    const labelElement = useRef(null);
    const inputElement = useRef(null);

    // generating a random id used to link the input's label to the input for accessibility users
    const uid = uuid.v4();

    const animatedStyles = {
        fontSize: fontSizeAnimation
    }

    const shrinkLabel = () => {
        inputElement.current.focus();
        Animated.timing(fontSizeAnimation, {
            toValue: 14,
            duration: 35,
            useNativeDriver: false
        }).start();
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

    useEffect(() => {
        if (errors != null){
            setErrorList(errors)
        }
    }, [ errors ])

    const onWrapperPress = () => {
        shrinkLabel();
    };

    const onInputChange = text => {
        setInputValue(text)
        setErrorList([]);
        if (onChangeText !== undefined) {
            onChangeText(text);
        }
    }

    const onInputBlur = () => {
        setFocusedElement(null);
        growLabel();
    }

    const isFocused = (
        (focusedElement !== null && inputElement.current === focusedElement)
        || (inputValue !== null && inputValue !== "")
    )

    const renderErrors = () => {
        const errorComponents = errorList.map((error, index) => {
	        return <InputError key={`${label}-${index}`} error={error} inputLabel={label} />
        });

        return (
            <React.Fragment>
                { errorComponents }
            </React.Fragment>
        )
    }

    return (
        <View style={{width: '100%', alignItems: 'center' }}>
            <Pressable
                testID="wrapper"
                style={{ width: "100%", alignItems: 'center' }}
                accessible={true}
                accessibilityHint={`Tap to select the ${label} input`}
                accessibilityState={{expanded: isFocused }}
                onPress={onWrapperPress}
            >
                <View
                    style={[
                        style,
                        styles.wrapper,
                        { borderColor: isFocused ? 'black' : errorList.length > 0 ? RED : GRAY }
                    ]}
                    ref={wrapperElement}
                >
                    <Animated.Text
                        style={[
                            styles.label,
                            animatedStyles,
                            { color: isFocused ? 'black' : errorList.length > 0 ? RED : GRAY }
                        ]}
                        ref={labelElement}
                        nativeID={uid}
                    >
                        {label}
                    </Animated.Text>
                    <TextInput
                        accessibilityLabel={`${label} Entry`}
                        accessibilityLabelledBy={uid}
                        {...options }
                        style={[styles.input, { display: isFocused ? 'flex' : 'none' }]}
                        value={inputValue}
                        ref={inputElement}
                        onChangeText={(e) => onInputChange(e)}
                        onFocus={() => setFocusedElement(inputElement.current) }
                        onBlur={() => onInputBlur()}

                    />
                </View>
            </Pressable>
            { renderErrors() }
        </View>
    );
};

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
	errors: []
}


export default InputSet;