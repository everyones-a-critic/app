import { mockStore } from '../testing/secureStoreMockResources';

const expo_secure_store = jest.createMockFromModule('expo-secure-store');

expo_secure_store.setItemAsync.mockImplementation(() => Promise);
expo_secure_store.getItemAsync.mockImplementation(key => {
    return Promise.resolve(mockStore[key])
});

module.exports = expo_secure_store;