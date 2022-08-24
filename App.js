import { useState } from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();

import SignUp from './src/views/SignUp';
import ConfirmAccount from "./src/views/ConfirmAccount";
import { FocusedElementContext } from "./src/context/focusedElement";


const App = () => {
    const [focusedElement, setFocusedElement ] = useState(null);

    return (
        <NavigationContainer>
            <FocusedElementContext.Provider value={{ focusedElement, setFocusedElement }}>
                <Stack.Navigator>
                    <Stack.Screen name="Sign Up" component={SignUp} options={{ headerShown: false }} />
                    <Stack.Screen name="Confirm Account" component={ConfirmAccount} options={{ headerShown: false }} />
                </Stack.Navigator>
            </FocusedElementContext.Provider>
        </NavigationContainer>
    );
};

export default App;