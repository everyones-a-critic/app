import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import ConfirmAccount from "./ConfirmAccount";
import SignIn from "./SignIn";

import { configureStore } from '@reduxjs/toolkit';
import accountReducer from "../features/account/accountSlice";

import { mockClient } from 'aws-sdk-client-mock';
import { CognitoIdentityProviderClient, ConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
const cognitoMock = mockClient(CognitoIdentityProviderClient);

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();


let store;
beforeEach(() => {
    cognitoMock.reset();
    store = configureStore({
        reducer: {
            account: accountReducer,
        }
    });
});

test('When confirmation code is invalid', async () => {
    const err = new Error("");
    err.name = "ExpiredCodeException";
    cognitoMock.on(ConfirmSignUpCommand).rejects(err);

    const screen = render(
        <Provider store={ store }>
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen name="Confirm Account" initialParams={{ email: 'test@test.com' }} component={ ConfirmAccount } options={{ headerShown: false }} />
                    <Stack.Screen name="Sign In" component={ SignIn } options={{ headerShown: false }} />
                </Stack.Navigator>
            </NavigationContainer>
        </Provider>
    );
    const ccInput = screen.getByLabelText("Confirmation Code Entry")
    fireEvent.changeText(ccInput, '1234')

    await waitFor(() => fireEvent.press(screen.getByText("Confirm Account")));
    expect(screen.getByRole("alert")).toHaveTextContent(
        "The code provided is invalid or has expired. Please login again and a new code will be sent to " +
        "your email."
    )
});

test('When confirmation code is empty', async () => {
    const screen = render(<Provider store={ store }><ConfirmAccount /></Provider>);
    fireEvent.press(screen.getByText("Confirm Account"));
    await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent("Confirmation Code is required")
    });
});

test('When confirmation is successful, user is redirected to Sign In page', async () => {
    cognitoMock.on(ConfirmSignUpCommand).resolves({});

    const screen = render(
        <Provider store={ store }>
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen name="Confirm Account" initialParams={{ email: 'test@test.com' }} component={ ConfirmAccount } options={{ headerShown: false }} />
                    <Stack.Screen name="Sign In" component={ SignIn } options={{ headerShown: false }} />
                </Stack.Navigator>
            </NavigationContainer>
        </Provider>
    );

    const ccInput = screen.getByLabelText("Confirmation Code Entry")
    fireEvent.changeText(ccInput, '1234')
    await waitFor(() => {
        fireEvent.press(screen.getByText("Confirm Account"));
    });
    expect(screen.getByText(
        "Your email has been verified. Welcome to Everyone's a Critic! Please sign in to get started."
    )).toBeTruthy();
});