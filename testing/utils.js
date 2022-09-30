import { expect } from '@jest/globals';

const toThrow = (func, expectedErrorMessage) => {
    let actualErrorMessage;
    try {
        func()
    } catch (e) {
        actualErrorMessage = e.message
    }

    if (actualErrorMessage === undefined) {
        return {
            message: () => 'expected an error, but one was not thrown',
            pass: false,
        }
    } else if (actualErrorMessage.includes(expectedErrorMessage)) {
        return {
            pass: true,
        }
    } else {
        return {
            message: () => `expected the errorMessage to contain ${expectedErrorMessage}, but error message was ${actualErrorMessage}`,
            pass: false,
        }
    }
};

expect.extend({
  toThrow,
});