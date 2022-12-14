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
import { CognitoIdentityProviderClient, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
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

    cognitoMock.on(InitiateAuthCommand).resolves({
        AuthenticationResult: {
            IdToken: "Test AccessToken",
            RefreshToken: "Test RefreshToken",
            TokenType: "Bearer"
        }
    });
});

afterEach(() => {
    cognitoMock.reset();
});

const renderSettingsComponent = async () => {
    let screen;
    await waitFor(() => {
        screen = render(
            <Provider store={store}>
                <NavigationContainer>
                    <Stack.Navigator>
                        <Stack.Screen name="Settings" component={ Settings } options={{ headerShown: false }} />
                        <Stack.Screen name="Sign In" component={ SignIn } options={{ headerShown: false }} />
                        <Stack.Screen name="Delete Account" component={ DeleteAccount } options={{ headerShown: false }} />
                    </Stack.Navigator>
                </NavigationContainer>
            </Provider>
        );
    });

    return screen;
}

test('When logout link is pressed, tokens are removed and user is navigated to signIn', async () => {
    const screen = await renderSettingsComponent();
    await waitFor(() => fireEvent.press(screen.getByText("Logout")));

    expect(deleteItemAsync).toHaveBeenCalledWith('RefreshToken');
    expect(deleteItemAsync).toHaveBeenCalledWith('IdentityToken');
    expect(screen.getByText("You've been successfully logged out.")).toBeTruthy();
});

test('When delete account link is pressed, user is navigated to delete account page', async () => {
    const screen = await renderSettingsComponent();
    await waitFor(() => fireEvent.press(screen.getByText("Delete Account")));

    expect(screen.getByText(
        "Are you sure you want to delete your account and its associated data? This action cannot be undone."
    )).toBeTruthy();
});