import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { act } from 'react-test-renderer';

import SignUp from './SignUp'
import SignIn from './SignIn'
import ConfirmAccount from "./ConfirmAccount";
import CommunityEnrollment from "./CommunityEnrollment";

import { configureStore } from '@reduxjs/toolkit';
import accountReducer from "../features/account/accountSlice";
import communitiesReducer from "../features/communities/communitiesSlice";

import { mockClient } from 'aws-sdk-client-mock';
import { CognitoIdentityProviderClient, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
const cognitoMock = mockClient(CognitoIdentityProviderClient);

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();

import { Provider } from 'react-redux';
import { setItemAsync } from "expo-secure-store";


let store;
beforeEach(() => {
    cognitoMock.reset();
    store = configureStore({
        reducer: {
            account: accountReducer,
            communities: communitiesReducer,
        }
    });
});

test('When username or password is invalid', async () => {
    const err = new Error("That password is wrong");
    err.name = "NotAuthorizedException";
    cognitoMock.on(InitiateAuthCommand).rejects(err);

    const screen = render(<Provider store={store}><SignIn /></Provider>);
    const emailInput = screen.getByLabelText("Email Entry")
    fireEvent.changeText(emailInput, 'test@test.com')
    const passwordInput = screen.getByLabelText("Password Entry")
    fireEvent.changeText(passwordInput, 'test')

    fireEvent.press(screen.getByText("Sign In"));
    await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent("That password is wrong")
    });
});

test('When password is empty', async () => {
    const screen = render(<Provider store={store}><SignIn /></Provider>);
    const emailInput = screen.getByLabelText("Email Entry");
    fireEvent.changeText(emailInput, 'test@test.com');
    fireEvent.press(screen.getByText("Sign In"));
    await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent("Password is required")
    });
});

test('When email is empty', async () => {
    const screen = render(<Provider store={store}><SignIn /></Provider>);
    const passwordInput = screen.getByLabelText("Password Entry")
    fireEvent.changeText(passwordInput, 'test')
    fireEvent.press(screen.getByText("Sign In"));
    await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent("Email is required")
    });
});

test('When sign up link is clicked, user is redirected to Sign Up page', async () => {
    const screen = render(
        <Provider store={store}>
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen name="Sign In" component={SignIn} options={{ headerShown: false }} />
                    <Stack.Screen name="Sign Up" component={SignUp} options={{ headerShown: false }} />
                </Stack.Navigator>
            </NavigationContainer>
        </Provider>
    );
    const link = screen.getByText("Sign Up")
    fireEvent(link, 'press');

    await waitFor(() => {
        expect(screen.getByAccessibilityHint("Navigate to Sign In page")).toBeTruthy();
    });
});

describe("When sign in is successful, ", () => {
    test('if confirmed, then refresh token should be saved and user is redirected to Community Enrollment page', async () => {
        cognitoMock.on(InitiateAuthCommand).resolves({
            AuthenticationResult: {
                IdToken: "Test IdToken",
                RefreshToken: "Test RefreshToken",
                TokenType: "Bearer"
            }
        });

        const screen = render(
            <Provider store={store}>
                <NavigationContainer>
                    <Stack.Navigator>
                        <Stack.Screen name="Sign In" component={SignIn} options={{ headerShown: false }} />
                        <Stack.Screen name="Community Enrollment" component={ CommunityEnrollment } options={{ headerShown: false }} />
                    </Stack.Navigator>
                </NavigationContainer>
            </Provider>
        );

        const emailInput = screen.getByLabelText("Email Entry")
        fireEvent.changeText(emailInput, 'test@test.com')
        const passwordInput = screen.getByLabelText("Password Entry")
        fireEvent.changeText(passwordInput, 'test')
        await waitFor(() => {
            fireEvent.press(screen.getByText("Sign In"))
        });
        expect(setItemAsync).toHaveBeenCalledWith('RefreshToken', 'Test RefreshToken');
        expect(setItemAsync).toHaveBeenCalledWith('IdentityToken', 'Test IdToken');
        expect(screen.getByText("Communities")).toBeTruthy();
    });

    test('when not confirmed, user is redirected to Confirmation Page', async () => {
        const err = new Error("");
        err.name = "UserNotConfirmedException";
        cognitoMock.on(InitiateAuthCommand).rejects(err);

        const screen = render(
            <Provider store={store}>
                <NavigationContainer>
                    <Stack.Navigator>
                        <Stack.Screen name="Sign In" component={ SignIn } options={{ headerShown: false }} />
                        <Stack.Screen name="Confirm Account" component={ ConfirmAccount } options={{ headerShown: false }} />
                    </Stack.Navigator>
                </NavigationContainer>
            </Provider>
        );

        const emailInput = screen.getByLabelText("Email Entry")
        fireEvent.changeText(emailInput, 'test@test.com')
        const passwordInput = screen.getByLabelText("Password Entry")
        fireEvent.changeText(passwordInput, 'test')

        await waitFor(() => {
            fireEvent.press(screen.getByText("Sign In"));
        });
        expect(screen.getByText("Confirmation Code")).toBeTruthy()
    });
});

test('When "next" route param is provided, successful sign in navigates to that page', async () => {
    cognitoMock.on(InitiateAuthCommand).resolves({
        AuthenticationResult: {
            IdToken: "Test IdToken",
            RefreshToken: "Test RefreshToken",
            TokenType: "Bearer"
        }
    });

    const screen = render(
        <Provider store={ store }>
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen name="Sign In" initialParams={{ next: 'Sign Up' }} component={ SignIn } options={{ headerShown: false }} />
                    <Stack.Screen name="Sign Up" component={ SignUp } options={{ headerShown: false }} />
                </Stack.Navigator>
            </NavigationContainer>
        </Provider>
    );

    const emailInput = screen.getByLabelText("Email Entry")
    fireEvent.changeText(emailInput, 'test@test.com')
    const passwordInput = screen.getByLabelText("Password Entry")
    fireEvent.changeText(passwordInput, 'test')

    await waitFor(() => {
        fireEvent.press(screen.getByText("Sign In"));
    });
    expect(screen.getByAccessibilityHint("Navigate to Sign In page")).toBeTruthy();
});

test('When "message" route param is provided, it should be rendered on the screen', async () => {
    const screen = render(
        <Provider store={ store }>
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen name="Sign In" initialParams={{ customMessage: 'Hello there' }} component={ SignIn } options={{ headerShown: false }} />
                </Stack.Navigator>
            </NavigationContainer>
        </Provider>
    );

    expect(screen.getByText("Hello there")).toBeTruthy();
});