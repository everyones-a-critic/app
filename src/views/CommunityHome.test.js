import { render, fireEvent, waitFor, cleanup } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();

import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import accountReducer from "../features/account/accountSlice";
import communitiesReducer from "../features/communities/communitiesSlice";
import productsReducer from "../features/products/productsSlice";

import CommunityHome from './CommunityHome';
import ProductHome from './ProductHome';


let store;
beforeEach(() => {
    store = configureStore({
        reducer: {
            account: accountReducer,
            communities: communitiesReducer,
            products: productsReducer,
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
    const productCards = await screen.findAllByLabelText("Product Header");
    expect(productCards.length).toEqual(2);
    expect(productCards[0]).toHaveTextContent('1');
    expect(productCards[1]).toHaveTextContent('2');

    const categoryElements = await screen.findAllByText('Category 1, Category 2');
    expect(categoryElements.length).toEqual(2);

    const priceElements = await screen.findAllByText('$30 for 10 servings');
    expect(priceElements.length).toEqual(2);
});