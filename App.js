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

import { FocusedElementContext } from "./src/context/focusedElement";


const App = () => {
    const [focusedElement, setFocusedElement ] = useState(null);

    return (
        <Provider store={store}>
            <NavigationContainer>
                <FocusedElementContext.Provider value={{ focusedElement, setFocusedElement }}>
                    <Stack.Navigator>
                        <Stack.Screen name="Splash Screen"
                                      component={ SplashScreen }
                                      options={{ headerShown: false }} />
                        <Stack.Screen name="Community Enrollment"
                                      component={ CommunityEnrollment }
                                      options={{ headerShown: false }} />
                        <Stack.Screen name="Community Home"
                                      component={ CommunityHome }
                                      options={{ headerShown: false, gestureEnabled: false }} />
                        <Stack.Screen name="Sign Up"
                                      component={ SignUp }
                                      options={{ headerShown: false }} />
                        <Stack.Screen name="Sign In"
                                      component={ SignIn }
                                      options={{ headerShown: false }} />
                        <Stack.Screen name="Confirm Account"
                                      component={ ConfirmAccount }
                                      options={{ headerShown: false }} />
                        <Stack.Screen name="Product Home"
                                      component={ ProductHome }
                                      options={{ headerShown: false }} />
                    </Stack.Navigator>
                </FocusedElementContext.Provider>
            </NavigationContainer>
        </Provider>
    );
};

export default App;