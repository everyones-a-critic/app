import { useState } from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();

import store from './src/app/store';
import { Provider } from 'react-redux';

import SignUp from './src/views/SignUp';
import SignIn from "./src/views/SignIn";
import ConfirmAccount from "./src/views/ConfirmAccount";
import CommunityEnrollment from "./src/views/CommunityEnrollment";
import CommunityHome from "./src/views/CommunityHome";
import ProductHome from "./src/views/ProductHome";
import SplashScreen from "./src/views/SplashScreen";
import Settings from "./src/views/Settings";
import DeleteAccount from "./src/views/DeleteAccount";

import { FocusedElementContext } from "./src/context/focusedElement";
import * as Sentry from 'sentry-expo';

Sentry.init({
  dsn: "https://c6aa256447a34942a16d0bab51528978@o4504095672696832.ingest.sentry.io/4504095674138624",
  enableInExpoDevelopment: true
});


const App = () => {
    const [focusedElement, setFocusedElement ] = useState(null);

    return (
        <Provider store={store}>
            <NavigationContainer>
                <FocusedElementContext.Provider value={{ focusedElement, setFocusedElement }}>
                    <Stack.Navigator>
                        <Stack.Screen name="Splash Screen"
                                      component={ SplashScreen }
                                      options={{ headerShown: false, gestureEnabled: false }} />
                        <Stack.Screen name="Sign Up"
                                      component={ SignUp }
                                      options={{ headerShown: false, gestureEnabled: false }} />
                        <Stack.Screen name="Sign In"
                                      component={ SignIn }
                                      options={{ headerShown: false, gestureEnabled: false }} />
                        <Stack.Screen name="Confirm Account"
                                      component={ ConfirmAccount }
                                      options={{ headerShown: false, gestureEnabled: false }} />
                        <Stack.Screen name="Community Enrollment"
                                      component={ CommunityEnrollment }
                                      options={{ headerShown: false, gestureEnabled: false }} />
                        <Stack.Screen name="Community Home"
                                      component={ CommunityHome }
                                      options={{ headerShown: false, gestureEnabled: false }} />
                        <Stack.Screen name="Product Home"
                                      component={ ProductHome }
                                      options={{ headerShown: false }} />
                        <Stack.Screen name="Settings"
                                      component={ Settings }
                                      options={{ headerShown: false }} />
                        <Stack.Screen name="Delete Account"
                                      component={ DeleteAccount }
                                      options={{ headerShown: false }} />
                    </Stack.Navigator>
                </FocusedElementContext.Provider>
            </NavigationContainer>
        </Provider>
    );
};

export default App;