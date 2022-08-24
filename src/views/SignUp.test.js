import { render, fireEvent, waitFor } from '@testing-library/react-native';

import SignUp from './SignUp'
import ConfirmAccount from "./ConfirmAccount";

import { mockClient } from 'aws-sdk-client-mock';
import { CognitoIdentityProviderClient, SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
const cognitoMock = mockClient(CognitoIdentityProviderClient);

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {FocusedElementContext} from "../context/focusedElement";
const Stack = createNativeStackNavigator();


jest.mock('@fortawesome/react-native-fontawesome', () => ({
    FontAwesomeIcon: ''
}))

beforeEach(() => {
    cognitoMock.reset();
});

test('When password is invalid', async () => {
    const err = new Error("Password is nasty");
    err.name = "InvalidPasswordException";
    cognitoMock.on(SignUpCommand).rejects(err);

    const screen = render(<SignUp />);
    const emailInput = screen.getByLabelText("Email Entry")
    fireEvent.changeText(emailInput, 'test@test.com')
    const passwordInput = screen.getByLabelText("Password Entry")
    fireEvent.changeText(passwordInput, 'test')

    fireEvent.press(screen.getByText("Sign Up"));
    await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent("Password is nasty")
    });
});

test('When password is empty', async () => {
    const screen = render(<SignUp />);
    fireEvent.press(screen.getByText("Sign Up"));
    const emailInput = screen.getByLabelText("Email Entry");
    fireEvent.changeText(emailInput, 'test@test.com');
    await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent("Password is required")
    });
});

test('When email is empty', async () => {
    const screen = render(<SignUp />);
    fireEvent.press(screen.getByText("Sign Up"));
    const passwordInput = screen.getByLabelText("Password Entry")
    fireEvent.changeText(passwordInput, 'test')
    await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent("Email is required")
    });
});

test('When email is already registered', async () => {
    const err = new Error("This shouldn't matter");
    err.name = "UsernameExistsException";
    cognitoMock.on(SignUpCommand).rejects(err);

    const screen = render(<SignUp />);
    const emailInput = screen.getByLabelText("Email Entry")
    fireEvent.changeText(emailInput, 'test@test.com')
    const passwordInput = screen.getByLabelText("Password Entry")
    fireEvent.changeText(passwordInput, 'test')

    fireEvent.press(screen.getByText("Sign Up"));
    await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent("A user is already registered with that email address. Please sign in.")
    });
});

test('When email is invalid', async () => {
    const err = new Error("Invalid email address format.");
    err.name = "InvalidParameterException";
    cognitoMock.on(SignUpCommand).rejects(err);

    const screen = render(<SignUp />);
    const emailInput = screen.getByLabelText("Email Entry")
    fireEvent.changeText(emailInput, 'test')
    const passwordInput = screen.getByLabelText("Password Entry")
    fireEvent.changeText(passwordInput, 'test')

    fireEvent.press(screen.getByText("Sign Up"));
    await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent("Invalid email address format.")
    });
});

test('When sign up is successful, user is redirected to Confirm Page', async () => {
    const err = new Error("Invalid email address format.");
    err.name = "InvalidParameterException";
    cognitoMock.on(SignUpCommand).resolves({});

    const screen = render(
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Sign Up" component={SignUp} options={{ headerShown: false }} />
                <Stack.Screen name="Confirm Account" component={ConfirmAccount} options={{ headerShown: false }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
    const emailInput = screen.getByLabelText("Email Entry")
    fireEvent.changeText(emailInput, 'test@test.com')
    const passwordInput = screen.getByLabelText("Password Entry")
    fireEvent.changeText(passwordInput, 'test')

    fireEvent.press(screen.getByText("Sign Up"));
    await waitFor(() => {
        expect(screen.getByText("A confirmation code was sent to the email address you provided. Enter this code below to confirm your account.")).toBeTruthy()
    });
});