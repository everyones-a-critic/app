import { render, fireEvent, waitFor, cleanup } from '@testing-library/react-native';
import TestRenderer from 'react-test-renderer';
const { act } = TestRenderer;

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();


import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import accountReducer from "../features/account/accountSlice";
import communitiesReducer from "../features/communities/communitiesSlice";
import productsReducer from "../features/products/productsSlice";
import ratingsReducer from "../features/ratings/ratingsSlice";

import CommunityHome from './CommunityHome';
import ProductHome from './ProductHome';


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
});


test('all products should load', async() => {
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
                    </Stack.Navigator>
                </NavigationContainer>
            </Provider>
        );
    });
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
                    </Stack.Navigator>
                </NavigationContainer>
            </Provider>
        );
    });

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