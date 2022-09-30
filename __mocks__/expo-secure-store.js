const expo_secure_store = jest.createMockFromModule('expo-secure-store');

expo_secure_store.setItemAsync.mockImplementation(() => Promise);
expo_secure_store.getItemAsync.mockImplementation(() => Promise.resolve("SomeToken"));

module.exports = expo_secure_store;