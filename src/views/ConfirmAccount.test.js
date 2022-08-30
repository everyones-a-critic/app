import { render, fireEvent, waitFor } from '@testing-library/react-native';

import ConfirmAccount from "./ConfirmAccount";

import { mockClient } from 'aws-sdk-client-mock';
import { CognitoIdentityProviderClient, ConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
const cognitoMock = mockClient(CognitoIdentityProviderClient);

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();

import store from '../../src/app/store';
import { Provider } from 'react-redux';

jest.mock('@fortawesome/react-native-fontawesome', () => ({
    FontAwesomeIcon: ''
}))

beforeEach(() => {
    cognitoMock.reset();
});

test('When confirmation code is invalid', async () => {
    const err = new Error("");
    err.name = "ExpiredCodeException";
    cognitoMock.on(ConfirmSignUpCommand).rejects(err);

    const screen = render(<Provider store={store}><ConfirmAccount /></Provider>);
    const ccInput = screen.getByLabelText("Confirmation Code Entry")
    fireEvent.changeText(ccInput, '1234')

    fireEvent.press(screen.getByText("Confirm Account"));
    await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
            "The code provided is invalid or has expired. Please login again and a new code will be sent to " +
            "your email."
        )
    });
});

test('When confirmation code is empty', async () => {
    const screen = render(<Provider store={store}><ConfirmAccount /></Provider>);
    fireEvent.press(screen.getByText("Confirm Account"));
    await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent("Confirmation Code is required")
    });
});

// test('When confirmation is successful, user is redirected to enrollment page', async () => {
//     cognitoMock.on(SignUpCommand).resolves({});
//
//     const screen = render(
//         <Provider store={store}>
//             <NavigationContainer>
//                 <Stack.Navigator>
//                     <Stack.Screen name="Confirm Account" component={ConfirmAccount} options={{ headerShown: false }} />
//                 </Stack.Navigator>
//             </NavigationContainer>
//         </Provider>
//     );
//
//     const ccInput = screen.getByLabelText("Confirmation Code Entry")
//     fireEvent.changeText(ccInput, '1234')
//     fireEvent.press(screen.getByText("Confirm Account"));
//     await waitFor(() => {
//         expect(screen.getByText("")).toBeTruthy()
//     });
// });