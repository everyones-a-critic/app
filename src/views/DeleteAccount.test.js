import { render, fireEvent, waitFor } from '@testing-library/react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();

import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import accountReducer from "../features/account/accountSlice";
import communitiesReducer from "../features/communities/communitiesSlice";
import productsReducer from "../features/products/productsSlice";
import ratingsReducer from "../features/ratings/ratingsSlice";

import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';
import { CognitoIdentityProviderClient, DeleteUserCommand } from "@aws-sdk/client-cognito-identity-provider";
const cognitoMock = mockClient(CognitoIdentityProviderClient);

import { deleteItemAsync } from 'expo-secure-store';

import Settings from "./Settings";
import SignIn from "./SignIn";
import DeleteAccount from "./DeleteAccount";


let store;
beforeEach(() => {
    store = configureStore({
        reducer: {
            account: accountReducer,
            communities: communitiesReducer,
            products: productsReducer,
            ratings: ratingsReducer
        }
    });

    cognitoMock.on(DeleteUserCommand).resolves();
});

afterEach(() => {
    cognitoMock.reset();
});

const renderDeleteAccountComponent = async () => {
    let screen;
    await waitFor(() => {
        screen = render(
            <Provider store={store}>
                <NavigationContainer>
                    <Stack.Navigator>
                        <Stack.Screen name="Delete Account" component={ DeleteAccount } options={{ headerShown: false }} />
                        <Stack.Screen name="Settings" component={ Settings } options={{ headerShown: false }} />
                        <Stack.Screen name="Sign In" component={ SignIn } options={{ headerShown: false }} />
                    </Stack.Navigator>
                </NavigationContainer>
            </Provider>
        );
    });

    return screen;
}

test('When delete account button is pressed, DeleteUserCommand is called and user is navigated to signIn', async () => {
    const screen = await renderDeleteAccountComponent();
    await waitFor(() => fireEvent.press(screen.getByText("Yes - Delete")));

    expect(cognitoMock).toHaveReceivedCommand(DeleteUserCommand);

    expect(screen.getByText(
        "Your user was successfully deleted."
    )).toBeTruthy();
});

test('When cancel button is pressed, user is navigated to Settings', async () => {
    const screen = await renderDeleteAccountComponent();
    await waitFor(() => fireEvent.press(screen.getByText("No - Cancel")));

    expect(screen.getByText(
        "Logout"
    )).toBeTruthy();
});