import { render, fireEvent, waitFor, cleanup } from '@testing-library/react-native';
import TestRenderer from 'react-test-renderer';
const { act } = TestRenderer;

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();

import { mockClient } from 'aws-sdk-client-mock';
import { CognitoIdentityProviderClient, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
const cognitoMock = mockClient(CognitoIdentityProviderClient);

import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import accountReducer from "../features/account/accountSlice";
import communitiesReducer from "../features/communities/communitiesSlice";
import productsReducer from "../features/products/productsSlice";
import ratingsReducer from "../features/ratings/ratingsSlice";

import CommunityHome from './CommunityHome';
import ProductHome from './ProductHome';
import SignIn from './SignIn';
import Settings from './Settings';


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

const renderCommunityHomeComponent = async () => {
    let screen;
    await waitFor(() => {
        screen = render(
            <Provider store={store}>
                <NavigationContainer>
                    <Stack.Navigator>
                        <Stack.Screen
                            name="Community Home"
                            initialParams={{ communityId: '3' }}
                            component={ CommunityHome }
                            options={{ headerShown: false }} />
                        <Stack.Screen name="Product Home" component={ ProductHome } options={{ headerShown: false }} />
                        <Stack.Screen name="Sign In" component={ SignIn } options={{ headerShown: false }} />
                        <Stack.Screen name="Settings" component={ Settings } options={{ headerShown: false }} />
                    </Stack.Navigator>
                </NavigationContainer>
            </Provider>
        );
    });

    return screen;
}

test('all products should load', async() => {
    const screen = await renderCommunityHomeComponent();
    let productCards = [];
    await act(async() => {
        productCards = await screen.findAllByLabelText("Product Header");
    });

    expect(productCards.length).toEqual(2);
    expect(productCards[0]).toHaveTextContent('1');
    expect(productCards[1]).toHaveTextContent('2');

    let categoryElements = [];
    await act(async() => {
        categoryElements = await screen.findAllByText('Category 1, Category 2');
    });
    expect(categoryElements.length).toEqual(2);

    let priceElements;
    await act(async() => {
        priceElements = await screen.findAllByText('$30 for 10 servings');
    });
    expect(priceElements.length).toEqual(2);
});

test('products with ratings should load', async() => {
    const screen = await renderCommunityHomeComponent();

    await act(async() => await fireEvent(screen.getByText("Your Reviews"), 'Press'));

    let productCards = [];
    await act(async() => {
        productCards = await screen.findAllByLabelText("Product Header");
    });

    expect(productCards.length).toEqual(2);
    expect(productCards[0]).toHaveTextContent('1');
    expect(productCards[1]).toHaveTextContent('2');

    let ratingTexts = [];
    await act(async() => {
        ratingTexts = await screen.findAllByLabelText("Your Rating");
    });

    expect(ratingTexts.length).toEqual(2);
    expect(ratingTexts[0]).toHaveTextContent('3.7');
    expect(ratingTexts[1]).toHaveTextContent('3.7');

    let categoryElements = [];
    await act(async() => {
        categoryElements = await screen.findAllByText('Category 1, Category 2');
    });
    expect(categoryElements.length).toEqual(2);

    let priceElements;
    await act(async() => {
        priceElements = await screen.findAllByText('$30 for 10 servings');
    });
    expect(priceElements.length).toEqual(2);
});

describe('Header', () => {
    test('switch communities link renders bottom sheet', async () => {
        const screen = await renderCommunityHomeComponent();
        await act(async() => await fireEvent(screen.getByLabelText("Community Enrollment Link"), 'Press'));

        let communityEnrollmentIdentifier;
        await act(async() => {
            communityEnrollmentIdentifier = await screen.getByText('Communities');
        });
        expect(communityEnrollmentIdentifier).toBeTruthy();
    });

    test('account link navigates to settings page', async () => {
        const screen = await renderCommunityHomeComponent();
        await act(async() => await fireEvent(screen.getByLabelText("Account Settings Link"), 'Press'));

        const settingsIdentifier = await screen.getByText('Settings');
        expect(settingsIdentifier).toBeTruthy();
    });
});