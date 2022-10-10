import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('@fortawesome/react-native-fontawesome', () => ({ FontAwesomeIcon: ''}))
jest.mock('@expo-google-fonts/work-sans', () => ({
    useFonts: () => [true],

}));
jest.mock('@gorhom/bottom-sheet', () => {
    const mockBottomSheet = require('@gorhom/bottom-sheet/mock');
    return {
        ...mockBottomSheet,
        __esModule: true
    };
});
jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);