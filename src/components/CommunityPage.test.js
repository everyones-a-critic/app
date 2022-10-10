import { render, fireEvent, waitFor, cleanup } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();

import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import accountReducer from "../features/account/accountSlice";
import communitiesReducer from "../features/communities/communitiesSlice";

import CommunityPage from './CommunityPage';
import CommunityEnrollment from '../views/CommunityEnrollment';


let store;
beforeEach(() => {
    store = configureStore({
        reducer: {
            account: accountReducer,
            communities: communitiesReducer,
        }
    });
});

test('should be able to navigate to Community Enrollment', async() => {
    const community = {
        id: '1',
        name: 'Test Community',
        icon: 'test',
        primary_color: '000000',
        secondary_color: 'FFFFFF',
    };
    const errors = [];

    let screen;
    await waitFor(() => {
        screen = render(
            <Provider store={store}>
                <NavigationContainer>
                    <Stack.Navigator>
                        <Stack.Screen name="Community Page" options={{ headerShown: false }}>
                            { props => <CommunityPage {...props} community={ community } errors={ errors } /> }
                        </Stack.Screen>
                        <Stack.Screen name="Community Enrollment" component={ CommunityEnrollment } options={{ headerShown: false }} />
                    </Stack.Navigator>
                </NavigationContainer>
            </Provider>
        );
    });
    const header = await screen.findByText('Test Community')
    fireEvent(header, 'press');
    expect(screen.getByText('Communities')).toBeTruthy();
});

test('when community is null, loader should be visible', async () => {
    const community = null;
    const errors = [];

    let screen;
    await waitFor(() => {
        screen = render(
            <Provider store={store}>
                <NavigationContainer>
                    <Stack.Navigator>
                        <Stack.Screen name="Community Page" options={{ headerShown: false }}>
                            { props => <CommunityPage {...props} community={ community } errors={ errors } /> }
                        </Stack.Screen>
                        <Stack.Screen name="Community Enrollment" component={ CommunityEnrollment } options={{ headerShown: false }} />
                    </Stack.Navigator>
                </NavigationContainer>
            </Provider>
        );
    });
    expect(screen.getByLabelText("Loading")).toBeTruthy();
});