import { mockReturnValues } from '../testing/apiMockResources';

const axios = jest.createMockFromModule('axios');
axios.create.mockReturnThis();
axios.create.mockImplementation((config) => {
    const og = jest.requireActual('axios');
    return {
        ...axios,
        interceptors: og.interceptors,
        request: axios.request.mockReturnThis()
    }
});
axios.request.mockReturnThis();
axios.post.mockReturnThis();
axios.delete.mockReturnThis();
axios.get.mockImplementation( url => {
    return mockReturnValues.get[url]
});

module.exports = axios;