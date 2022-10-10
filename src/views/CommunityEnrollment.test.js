import { render, fireEvent, waitFor, cleanup } from '@testing-library/react-native';
// import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils';
// import { State } from 'react-native-gesture-handler';
import axios from 'axios';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux';

import communitiesReducer from "../features/communities/communitiesSlice";
import accountReducer from "../features/account/accountSlice";
import productsReducer from "../features/products/productsSlice";
import CommunityEnrollment from "./CommunityEnrollment";
import CommunityHome from "./CommunityHome";
import SignIn from "./SignIn";
import { mockReturnValues } from '../../testing/apiMockResources';
import '../../testing/utils';

let store;
beforeEach(() => {
    store = configureStore({
        reducer: {
            account: accountReducer,
            communities: communitiesReducer,
            products: productsReducer,
        }
    });

    axios.get.mockImplementation( url => {
        return mockReturnValues.get[url]
    });

    axios.post.mockImplementation( url => {
        return {
            "isBase64Encoded": true,
            'statusCode': 200,
            'headers': null,
            'multiValueHeaders': null,
            'data': {}
        }
    });

    axios.delete.mockImplementation( url => {
        return {
            "isBase64Encoded": true,
            'statusCode': 200,
            'headers': null,
            'multiValueHeaders': null,
            'data': {}
        }
    });
});

afterEach(() => {
    jest.clearAllMocks();
});

test('When user is a community member, enrolled section and enrolled communities are rendered ', async() => {
    let screen;
    await waitFor(() => {
        screen = render(
            <Provider store={store}>
                <CommunityEnrollment/>
            </Provider>
        );
    });

    expect(screen.getByText('Your Communities')).toBeTruthy()
    expect(screen.getByAccessibilityHint('Tap to open the 3 page')).toHaveTextContent("3");
    expect(screen.getByAccessibilityHint('Tap to open the 6 page')).toHaveTextContent("6");
    expect(() => screen.getByAccessibilityHint('Tap to join the 3 community')).toThrow('Unable to find an element');
});

test('When not a community member, enrolled section is not rendered', async () => {
    const overrides = {
        '/communities?isMember=true&page=1': {
            "isBase64Encoded": true,
            'statusCode': 200,
            'headers': null,
            'multiValueHeaders': null,
            'data': {
                'next': null,
                'previous': null,
                'results': []
            }
        }
    };

    axios.get.mockImplementation(url => {
        const returnValuesCopy = {};
        Object.assign(returnValuesCopy, mockReturnValues.get, overrides);
        return returnValuesCopy[url];
    });

    let screen;
    await waitFor(() => {
        screen = render(
            <Provider store={store}>
                <CommunityEnrollment/>
            </Provider>
        );
    });

    expect(() => screen.getByText('Your Communities')).toThrow('Unable to find an element');
});

test('All communities section is rendered and more render on scroll', async () => {
    let screen;
    await waitFor(() => {
        screen = render(
            <Provider store={store}>
                <CommunityEnrollment/>
            </Provider>
        );

        expect(screen.getByAccessibilityHint('Tap to join the 1 community')).toHaveTextContent("1");
        expect(screen.getByAccessibilityHint('Tap to join the 25 community')).toHaveTextContent("25");

        const scrollView = screen.getByAccessibilityHint('Scroll to see more communities to join.')
        fireEvent(scrollView, 'scrollEndDrag', {
            nativeEvent: {
                contentSize: { height: 1500 },
                layoutMeasurement: { height: 400 },
                contentOffset: { y: 800 }
            }
        });
    });

    expect(screen.getByAccessibilityHint('Tap to join the 26 community')).toHaveTextContent("26");
});

test('On search, trending results disappear and search results appear', async () => {
    let screen;
    await waitFor(() => {
        screen = render(
            <Provider store={store}>
                <CommunityEnrollment/>
            </Provider>
        );

        // before search
        expect(screen.getByText('Trending')).toBeTruthy();
        expect(screen.getByAccessibilityHint('Tap to join the 1 community')).toHaveTextContent("1");

        // do search
        fireEvent.changeText(screen.getByRole('search'), 'test')
        fireEvent(screen.getByRole('search'), 'submitEditing')
    });

    // after search
    expect(() => screen.getByText('Trending')).toThrow('Unable to find an element');
    expect(() => screen.getByAccessibilityHint('Tap to join the 1 community')).toThrow('Unable to find an element');
    expect(screen.getByText('Search Results')).toBeTruthy();
    expect(screen.getByAccessibilityHint('Tap to join the 51 community')).toHaveTextContent("51");
});

test('On press of available community, join command is sent and community moves to enrolled section', async () => {
    let screen;
    await waitFor(() => {
        screen = render(
            <Provider store={store}>
                <CommunityEnrollment/>
            </Provider>
        );
        fireEvent(screen.getByAccessibilityHint('Tap to join the 1 community'), 'press');
    });

    expect(() => screen.getByAccessibilityHint('Tap to join the 1 community')).toThrow('Unable to find an element');
    expect(screen.getByAccessibilityHint('Tap to open the 1 page')).toBeTruthy();
});


// Not possible to test until Swipeable implements testId, withTestId, accessibilityRole or some identifier
// https://github.com/software-mansion/react-native-gesture-handler/blob/main/src/components/Swipeable.tsx
// test('On leave community, leave command is sent and community moves to available section', async () => {
//     const store = configureStore({
//         reducer: {
//             communities: communitiesReducer,
//         }
//     });
//
//     let screen;
//     await waitFor(() => {
//         screen = render(
//             <Provider store={store}>
//                 <CommunityEnrollment/>
//             </Provider>
//         );
//
//         fireGestureHandler(getByGestureTestId('swipeable-3'), [
//             { state: State.BEGAN, translationX: 0 },
//             { state: State.ACTIVE, translationX: -20 },
//             { translationX: -30 },
//             { translationX: -65 },
//             { state: State.END, translationX: -65 },
//         ]);
//         fireEvent(screen.getByAccessibilityHint('Press to leave the 3 community'), 'press');
//     });
//
//     expect(() => screen.getByAccessibilityHint('Tap to leave the 3 community')).toThrow('Unable to find an element');
//     expect(screen.getByAccessibilityHint('Tap to join the 3 community')).toBeTruthy();
// });

test('On press enrolled community, navigate to ', async () => {
    let screen;
    await waitFor(() => {
        screen = render(
            <Provider store={store}>
                <NavigationContainer>
                    <Stack.Navigator>
                        <Stack.Screen name="Community Enrollment" component={ CommunityEnrollment } options={{ headerShown: false }} />
                        <Stack.Screen name="Community Home" component={ CommunityHome } options={{ headerShown: false }} />
                    </Stack.Navigator>
                </NavigationContainer>
            </Provider>
        );
        fireEvent(screen.getByAccessibilityHint('Tap to open the 3 page'), 'press');
    });
    expect(screen.getByRole('header')).toHaveTextContent('3');
});

describe('Error modal renders', () => {
    test('upon enrolled list error', async () => {
        const rejectValue = {
            response: {
                status: 400,
                data: { message: "something went wrong" }
            }
        }
        const overrides = {
            '/communities?isMember=true&page=1': Promise.reject(rejectValue)
        };
        axios.get.mockImplementation(url => {
            const returnValuesCopy = {};
            Object.assign(returnValuesCopy, mockReturnValues.get, overrides);
            return returnValuesCopy[url];
        });

        let screen;
        await waitFor(() => {
            screen = render(
                <Provider store={store}>
                    <CommunityEnrollment/>
                </Provider>
            );
        });
        expect(screen.getByRole('alert')).toHaveTextContent(
            "Please try again later. If the error persists, please reach out to support@everyonesacriticapp.com"
        );
    });

    test('upon list communities error', async () => {
        const rejectValue = {
            response: {
                status: 400,
                data: { message: "something went wrong" }
            }
        }
        const overrides = {
            '/communities?page=1': Promise.reject(rejectValue)
        };
        axios.get.mockImplementation(url => {
            const returnValuesCopy = {};
            Object.assign(returnValuesCopy, mockReturnValues.get, overrides);
            return returnValuesCopy[url];
        });

        let screen;
        await waitFor(() => {
            screen = render(
                <Provider store={store}>
                    <CommunityEnrollment/>
                </Provider>
            );
        });

        expect(screen.getByRole('alert')).toHaveTextContent(
            "Please try again later. If the error persists, please reach out to support@everyonesacriticapp.com"
        );
    });

    test('upon search error', async () => {
        const rejectValue = {
            response: {
                status: 400,
                data: { message: "something went wrong" }
            }
        }
        const overrides = {
            'communities/?searchString=test': Promise.reject(rejectValue)
        };
        axios.get.mockImplementation(url => {
            const returnValuesCopy = {};
            Object.assign(returnValuesCopy, mockReturnValues.get, overrides);
            return returnValuesCopy[url];
        });

        let screen;
        await waitFor(() => {
            screen = render(
                <Provider store={store}>
                    <CommunityEnrollment/>
                </Provider>
            );
            fireEvent.changeText(screen.getByRole('search'), 'test')
            fireEvent(screen.getByRole('search'), 'submitEditing')
        });

        expect(screen.getByRole('alert')).toHaveTextContent(
            "Please try again later. If the error persists, please reach out to support@everyonesacriticapp.com"
        );
    });

    test('upon join error', async () => {
        const rejectValue = {
            response: {
                status: 400,
                data: { message: "something went wrong" }
            }
        }
        axios.post.mockImplementation(url => {
            return Promise.reject(rejectValue)
        });

        let screen;
        await waitFor(() => {
            screen = render(
                <Provider store={store}>
                    <CommunityEnrollment/>
                </Provider>
            );
            fireEvent(screen.getByAccessibilityHint('Tap to join the 1 community'), 'press');
        });

        expect(screen.getByRole('alert')).toHaveTextContent(
            "Please try again later. If the error persists, please reach out to support@everyonesacriticapp.com"
        );
    });

//     test('upon leave error', async () => {
//
//     });
});

describe('User is routed to login page', () => {
    test('upon enrolled list error', async () => {
        const rejectValue = {
            response: {
                status: 401,
                data: { message: "expired token" }
            }
        }
        const overrides = {
            '/communities?isMember=true&page=1': Promise.reject(rejectValue)
        };
        axios.get.mockImplementation(url => {
            const returnValuesCopy = {};
            Object.assign(returnValuesCopy, mockReturnValues.get, overrides);
            return returnValuesCopy[url];
        });

        let screen;
        await waitFor(() => {
            screen = render(
                <Provider store={store}>
                    <NavigationContainer>
                        <Stack.Navigator>
                            <Stack.Screen name="Community Enrollment" component={ CommunityEnrollment } options={{ headerShown: false }} />
                            <Stack.Screen name="Sign In" component={ SignIn } options={{ headerShown: false }} />
                        </Stack.Navigator>
                    </NavigationContainer>
                </Provider>
            );
        });

        expect(screen.getByText("Your session has expired, please sign in again.")).toBeTruthy()
    });

    test('upon list communities error', async () => {
        const rejectValue = {
            response: {
                status: 401,
                data: { message: "expired token" }
            }
        }
        const overrides = {
            '/communities?page=1': Promise.reject(rejectValue)
        };
        axios.get.mockImplementation(url => {
            const returnValuesCopy = {};
            Object.assign(returnValuesCopy, mockReturnValues.get, overrides);
            return returnValuesCopy[url];
        });

        let screen;
        await waitFor(() => {
            screen = render(
                <Provider store={store}>
                    <NavigationContainer>
                        <Stack.Navigator>
                            <Stack.Screen name="Community Enrollment" component={ CommunityEnrollment } options={{ headerShown: false }} />
                            <Stack.Screen name="Sign In" component={ SignIn } options={{ headerShown: false }} />
                        </Stack.Navigator>
                    </NavigationContainer>
                </Provider>
            );
        });

        expect(screen.getByText("Your session has expired, please sign in again.")).toBeTruthy()
    });

    test('upon search error', async () => {
        const rejectValue = {
            response: {
                status: 401,
                data: { message: "expired token" }
            }
        }
        const overrides = {
            'communities/?searchString=test': Promise.reject(rejectValue)
        };
        axios.get.mockImplementation(url => {
            const returnValuesCopy = {};
            Object.assign(returnValuesCopy, mockReturnValues.get, overrides);
            return returnValuesCopy[url];
        });

        let screen;
        await waitFor(() => {
            screen = render(
                <Provider store={store}>
                    <NavigationContainer>
                        <Stack.Navigator>
                            <Stack.Screen name="Community Enrollment" component={ CommunityEnrollment } options={{ headerShown: false }} />
                            <Stack.Screen name="Sign In" component={ SignIn } options={{ headerShown: false }} />
                        </Stack.Navigator>
                    </NavigationContainer>
                </Provider>
            );

            fireEvent.changeText(screen.getByRole('search'), 'test')
            fireEvent(screen.getByRole('search'), 'submitEditing')
        });

        expect(screen.getByText("Your session has expired, please sign in again.")).toBeTruthy();
    });

    test('upon join error', async () => {
        const rejectValue = {
            response: {
                status: 401,
                data: { message: "expired token" }
            }
        }
        axios.post.mockImplementation(url => {
            return Promise.reject(rejectValue)
        });

        let screen;
        await waitFor(() => {
            screen = render(
                <Provider store={store}>
                    <NavigationContainer>
                        <Stack.Navigator>
                            <Stack.Screen name="Community Enrollment" component={ CommunityEnrollment } options={{ headerShown: false }} />
                            <Stack.Screen name="Sign In" component={ SignIn } options={{ headerShown: false }} />
                        </Stack.Navigator>
                    </NavigationContainer>
                </Provider>
            );
            fireEvent(screen.getByAccessibilityHint('Tap to join the 1 community'), 'press');
        });

        expect(screen.getByText("Your session has expired, please sign in again.")).toBeTruthy();
    });

//     test('upon join error', async () => {}
});