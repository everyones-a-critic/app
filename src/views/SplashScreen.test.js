import { Animated } from "react-native";
import { render, fireEvent, waitFor, within } from '@testing-library/react-native';
import TestRenderer from 'react-test-renderer';
const { act } = TestRenderer;
import { getItemAsync } from 'expo-secure-store';
import axios from 'axios';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();

import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import communitiesReducer from "../features/communities/communitiesSlice";
import productsReducer from "../features/products/productsSlice";
import accountReducer from "../features/account/accountSlice";
import { mockReturnValues } from '../../testing/apiMockResources';
import { mockStore } from '../../testing/secureStoreMockResources';

import CommunityHome from './CommunityHome';
import CommunityEnrollment from './CommunityEnrollment';
import SplashScreen from './SplashScreen';
import SignIn from './SignIn';
import SignUp from './SignUp';


let store;
beforeEach(() => {
    store = configureStore({
        reducer: {
            communities: communitiesReducer,
            products: productsReducer,
            account: accountReducer,
        }
    });

    axios.get.mockImplementation( url => {
        return mockReturnValues.get[url]
    });

    getItemAsync.mockImplementation( key => {
        return Promise.resolve(mockStore[key])
    });
});

afterEach(() => {
    jest.clearAllMocks();
});

// Hit an issue here with waitFor depending on setInterval, so implementing workaround suggested here while
// RTNL team is figuring out a solution:
// https://github.com/testing-library/react-hooks-testing-library/issues/631
jest.useFakeTimers({doNotFake: [
    'setImmediate',
    'setInterval',
    'cancelAnimationFrame',
    'cancelIdleCallback',
    'clearImmediate',
    'clearInterval',
//     'clearTimeout',
    'nextTick',
    'queueMicrotask',
]});
jest.spyOn(Animated, 'timing');
jest.spyOn(global, 'setTimeout');

const renderSplashScreen = async () => {
    const screen = render(
        <Provider store={ store }>
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen
                        name="SplashScreen"
                        component={ SplashScreen }
                        options={{ headerShown: false }} />
                    <Stack.Screen
                        name="Sign In"
                        component={ SignIn }
                        options={{ headerShown: false }} />
                    <Stack.Screen
                        name="Sign Up"
                        component={ SignUp }
                        options={{ headerShown: false }} />
                    <Stack.Screen
                        name="Community Home"
                        component={ CommunityHome }
                        options={{ headerShown: false }} />
                    <Stack.Screen
                        name="Community Enrollment"
                        component={ CommunityEnrollment }
                        options={{ headerShown: false }} />
                </Stack.Navigator>
            </NavigationContainer>
        </Provider>
    )
    await waitFor(() => screen.getByText('Critic'));

    return screen;
}

test('when screen renders, text fades in', async () => {
    const screen = await renderSplashScreen();

    expect(screen.getByText('Critic')).toHaveStyle({opacity: 0})
    await act(async() => {
        // 2 seconds for text to fade in
        await jest.advanceTimersByTime(2000);;
    });

    expect(screen.getByText('Critic')).toHaveStyle({opacity: 1})
});

test('After data load and 2 seconds, secondary text fades in', async () => {
    const screen = await renderSplashScreen();
    expect(screen.getByText('3')).toHaveStyle({opacity: 0})
    expect(screen.getByText('3')).toHaveStyle({fontSize: 0})

    await act(async() => {
        // 3 seconds for initial animations to work and data to load
        await jest.advanceTimersByTime(3000);
    });
    await act(async() => {
        // 2 seconds for main icon to fade out
        await jest.advanceTimersByTime(2000);
    });
    await act(async() => {
        // 2 seconds for secondary text/icon to fade in
        await jest.advanceTimersByTime(2000);
    });
    expect(screen.getByText('3')).toHaveStyle({opacity: 1})
    expect(screen.getByText('3')).toHaveStyle({fontSize: 100})

});

test('when refresh token does not exist, we end up on sign up page', async () => {
    getItemAsync.mockResolvedValueOnce(undefined);

    const screen = await renderSplashScreen();
    await act(async() => {
        // 3 seconds for initial animations to work and data to load
        await jest.advanceTimersByTime(3000);
    });
    expect(screen.getByAccessibilityHint("Navigate to Sign In page")).toBeTruthy();
});

test('when refresh token exists, but auth error is received on get community, navigate to sign in page', async () => {
    const rejectValue = {
        response: {
            status: 401,
            data: { message: "token expired" }
        }
    }
    const overrides = {
        'communities/3/': Promise.reject(rejectValue)
    };
    axios.get.mockImplementation(url => {
        const returnValuesCopy = {};
        Object.assign(returnValuesCopy, mockReturnValues.get, overrides);
        return returnValuesCopy[url];
    });

    const screen = await renderSplashScreen();
    await act(async() => {
        // 3 seconds for initial animations to work and data to load
        await jest.advanceTimersByTime(3000);
    });
    expect(screen.getByAccessibilityHint("Navigate to Sign Up page")).toBeTruthy();
});

test('when refresh token exists, but no community focused, user is navigated to Community Enrollment', async () => {
    console.log("\n--------------------")
    console.log("when refresh token exists, but no community focused, user is navigated to Community Enrollment")
    const overrideMap = {
        RefreshToken: 'Some Token'
    }
    getItemAsync.mockImplementation(key => {
        return overrideMap[key]
    });

    const screen = await renderSplashScreen();
    await act(async() => {
        // 3 seconds for initial animations to work and data to load
        await jest.advanceTimersByTime(3000);
    });

    expect(screen.getByText('Your Communities')).toBeTruthy()
});

test('when refresh token exists and get community is successful, we end up on community page', async () => {
    console.log("\n--------------------")
    console.log("when refresh token exists and get community is successful, we end up on community page")
    const screen = await renderSplashScreen();
    await act(async() => {
        // 3 seconds for initial animations to work and data to load
        await jest.advanceTimersByTime(3000);
    });
    await act(async() => {
        // 2 seconds for main icon to fade out
        await jest.advanceTimersByTime(2000);
    });
    await act(async() => {
        // 2 seconds for secondary text/icon to fade in
        await jest.advanceTimersByTime(2000);
    });

    await act(async() => {
        // 3 seconds before navigating to CommunityHome
        await jest.advanceTimersByTime(3000);
    });

    jest.runAllTimers();
    headers = await screen.findAllByRole("header");
    expect(headers[0]).toHaveTextContent('3');
    jest.runAllTimers();
    const productCards = await screen.findAllByLabelText("Product Header");
    expect(productCards.length).toEqual(2);
});

