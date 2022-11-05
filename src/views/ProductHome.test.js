import { render, fireEvent, waitFor, cleanup } from '@testing-library/react-native';
import TestRenderer from 'react-test-renderer';
const { act } = TestRenderer;

import { NavigationContainer } from '@react-navigation/native';
import axios from 'axios';
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
import { mockReturnValues } from '../../testing/apiMockResources';

import ProductHome from './ProductHome';
import SignIn from './SignIn';
import CommunityHome from './CommunityHome';


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

    axios.post.mockImplementation( url => {
        return mockReturnValues.post[url] || {}
    });

    axios.patch.mockImplementation( url => {
        return mockReturnValues.patch[url] || {}
    });

    axios.get.mockImplementation( url => {
        return mockReturnValues.get[url]
    });

    jest.useFakeTimers({doNotFake: [
        'setImmediate',
        'setInterval',
        'cancelAnimationFrame',
        'cancelIdleCallback',
        'clearImmediate',
        'clearInterval',
        'nextTick',
        'queueMicrotask',
    ]});

    cognitoMock.on(InitiateAuthCommand).resolves({
        AuthenticationResult: {
            IdToken: "Test AccessToken",
            RefreshToken: "Test RefreshToken",
            TokenType: "Bearer"
        }
    });
});

afterEach(() => {
    jest.clearAllMocks();
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    cognitoMock.reset();
});


const renderView = async () => {
    let screen;
    await waitFor(() => {
        screen = render(
            <Provider store={store}>
                <NavigationContainer>
                    <Stack.Navigator>
                        <Stack.Screen
                            name="Product Home"
                            initialParams={{ communityId: '3', productId: '1' }}
                            component={ ProductHome }
                            options={{ headerShown: false }} />
                        <Stack.Screen
                            name="Sign In"
                            component={ SignIn }
                            options={{ headerShown: false }} />
                        <Stack.Screen
                            name="Community Home"
                            component={ CommunityHome }
                            options={{ headerShown: false }} />
                    </Stack.Navigator>
                </NavigationContainer>
            </Provider>
        );
    });

    return screen
}

describe('When product and community are loaded', () => {
    test('Header should render', async () => {
        const screen = await renderView();
        const productHeader = await screen.getByLabelText("Product Name");
        expect(productHeader).toHaveTextContent('1');
    });

    test('Primary Fields should render', async () => {
        const screen = await renderView();
        expect(screen.getByLabelText("Price")).toHaveTextContent("$30");
        expect(screen.getByLabelText("Categories")).toHaveTextContent("Category 1, Category 2");
    });

    test('Secondary Fields should render', async () => {
        const screen = await renderView();
        expect(screen.getByLabelText("Sample 1")).toHaveTextContent("1");
        expect(screen.getByLabelText("Sample")).toHaveTextContent("2");
    });
});

test('when rating icon is selected, rating is posted & bottom sheet appears', async () => {
    const overrides = {
        '/products/1/ratings/?mostRecent=true': {
            'statusCode': 200,
            'headers': null,
            'data': {
                next: null,
                previous: null,
                results: []
            }
        }
    };
    axios.get.mockImplementation(url => {
        const returnValuesCopy = {};
        Object.assign(returnValuesCopy, mockReturnValues.get, overrides);
        return returnValuesCopy[url];
    });

    const screen = await renderView();
    await act(async() => {
        await fireEvent(screen.getByLabelText('4'), 'Press');
    });

    expect(axios.post).toHaveBeenCalledWith("/products/1/ratings/", { "rating": 3.67 });

    await act(async() => {
        // 1 second for bottom sheet to appear
        await jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText("Enjoyable and exciting. An experience you are likely to seek out again.")).toBeTruthy();
    expect(screen.getByLabelText('Your Rating')).toHaveTextContent('4');
});

test('when rating icon is unselected, rating is archived & bottom sheet closes', async () => {
    const screen = await renderView();
    await act(async() => {
        fireEvent(screen.getByLabelText('4'), 'Press');
    });

    await act(async() => {
        // 1 second for bottom sheet to appear
        await jest.advanceTimersByTime(1000);
        await fireEvent(screen.getByLabelText('4'), 'Press');
    });

    expect(axios.patch).toHaveBeenCalledWith("/products/1/ratings/1/", { "archived": true });
    expect(screen.getByLabelText('Your Rating')).toHaveTextContent('');
});

test('when comparison selections are changed, patch is sent to api', async () => {
    const overrides = {
        '/products/1/ratings/1/': {
            'statusCode': 200,
            'headers': null,
            'data': {
                id: '1',
                productId: '1',
                rating: 4,
                archived: false,
                comments: 'This is a test',
            }
        }
    };
    axios.patch.mockImplementation(url => {
        const returnValuesCopy = {};
        Object.assign(returnValuesCopy, mockReturnValues.patch, overrides);
        return returnValuesCopy[url];
    });

    // this flow requires that clicking on an already selected rating icon opens the EditRating bottom sheet
    // so we're kind of testing that as well
    const screen = await renderView();
    await act(async() => await fireEvent(screen.getByLabelText('4'), 'Press'));

    // 1 second for bottom sheet to appear
    await act(async() => await jest.advanceTimersByTime(1000));

    await act(async() => await fireEvent(screen.getByText("Better"), 'Press'));

    expect(axios.patch).toHaveBeenCalledWith("/products/1/ratings/1/", { "rating": 4 });
});

test('when comments are added, patch is sent to api', async () => {
    // this flow requires that clicking on an already selected rating icon opens the EditRating bottom sheet
    // so we're kind of testing that as well
    overrides = {
        '/products/1/ratings/1/': {
            'statusCode': 200,
            'headers': null,
            'data': {
                id: '1',
                productId: '1',
                rating: 3.67,
                archived: false,
                comments: 'hi there.',
            }
        }
    };
    axios.patch.mockImplementation(url => {
        const returnValuesCopy = {};
        Object.assign(returnValuesCopy, mockReturnValues.patch, overrides);
        return returnValuesCopy[url];
    });

    const screen = await renderView();
    await act(async() => await fireEvent(screen.getByLabelText('4'), 'Press'));

    // 1 second for bottom sheet to appear
    await act(async() => await jest.advanceTimersByTime(1000));

    await act(async() => await fireEvent.changeText(screen.getByLabelText("Comments"), "hi there."));

    // 500 ms for debouncing to work
    await act(async() => await jest.advanceTimersByTime(500));

    expect(axios.patch).toHaveBeenCalledWith("/products/1/ratings/1/", {
        comments: "hi there.",
    });
});

test('When footer community home link is pressed, user is navigated to CommunityHome', async () => {
    const screen = await renderView();
    await act(async() => {
        fireEvent(screen.getByLabelText('Community Home Link'), 'Press');
    });

    const communityHomeIdentifier = await screen.getByText('Browse');
    expect(communityHomeIdentifier).toBeTruthy();
});