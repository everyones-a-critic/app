import { render, waitFor } from '@testing-library/react-native';
import { View, Text } from "react-native";
import { useEffect, useState } from "react";
import { Provider } from 'react-redux';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();

import { configureStore } from '@reduxjs/toolkit';
import accountReducer from "../features/account/accountSlice";


import SignIn from "../views/SignIn";
import AuthenticationProvider from "./AuthenticationProvider";


const TestComponent = ({ navigation }) => {
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        setStatus(true);
    })

    return (
        <View><AuthenticationProvider authExpired={ status } navigation={ navigation }>
            <Text>Test</Text>
        </AuthenticationProvider></View>
    );
}


let store;
beforeEach(() => {
    store = configureStore({
        reducer: {
            account: accountReducer,
        }
    });
});

test('When requestStatus is expiredAuth, redirects to login page', async() => {
    const screen = render(
        <Provider store={store}>
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen name="Auth Test" component={ TestComponent } options={{ headerShown: false }} />
                    <Stack.Screen name="Sign In" component={ SignIn } options={{ headerShown: false }} />
                </Stack.Navigator>
            </NavigationContainer>
        </Provider>
    );

    await waitFor(() => {
        expect(screen.getByText("Your session has expired, please sign in again.")).toBeTruthy()
    });
});