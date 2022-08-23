import {Animated} from "react-native";
import { render, screen, fireEvent } from '@testing-library/react-native';
import InputSet from "./InputSet";

jest.useFakeTimers();
jest.spyOn(Animated, 'timing');

describe('When input is focused', () => {
    test('the input label should shrink', () => {
        render(<InputSet label="Sample" />)
        // fontSize should be 18 before we press the wrapper
        expect(screen.getByText("Sample")).toHaveStyle({fontSize: 18});
        fireEvent.press(screen.getByText("Sample"))
        jest.advanceTimersByTime(50);
        // fontSize should be 14 after we press the wrapper
        expect(screen.getByText("Sample")).toHaveStyle({fontSize: 14});
    });

    // this is not possible to test, because of the issue with the testing library reported here:
    // https://github.com/callstack/react-native-testing-library/issues/1069
    // test('the input element should appear', () => {});
});

describe('When input is blurred', () => {
    describe('if input is empty', () => {
        test('the input label should grow', () => {
            render(<InputSet label="Sample" />);
            // input should be hidden before we press the wrapper
            const input = screen.getByLabelText("Sample Entry")
            fireEvent.press(screen.getByText("Sample"))
            // input should be visible after we press the wrapper
            fireEvent(input, 'onBlur');
            expect(screen.getByText("Sample")).toHaveStyle({fontSize: 18});
        });

        // not possible to test because of focus issue reported above
        // test('the input element should disappear', () => {});
    });

    describe('if input is not empty', () => {
        test('the input label should not grow', () => {
            render(<InputSet label="Sample" />);
            fireEvent.press(screen.getByText("Sample"))
            // input should be visible after we press the wrapper
            const input = screen.getByLabelText("Sample Entry");
            fireEvent.changeText(input, 'abc')
            fireEvent(input, 'onBlur');
            jest.advanceTimersByTime(50)
            expect(screen.getByText("Sample")).toHaveStyle({fontSize: 14});
            // });
        });
        // not possible to test because of focus issue reported above
        test('the input element should not disappear', () => { });
    });
});

describe('InputError should not render when error is', () => {
    test('null', () => {
        render(<InputSet error={null} label="Sample" />);
        let notFound = false;
        try {
            screen.getByRole("alert");
        } catch(e) {
            notFound = true
        }

        expect(notFound).toBeTruthy()
    });

    test('undefined', () => {
        render(<InputSet error={undefined} label="Sample" />);
        let notFound = false;
        try {
            screen.getByRole("alert");
        } catch(e) {
            notFound = true
        }

        expect(notFound).toBeTruthy()
    });

    test('an empty string', () => {
        render(<InputSet error="" label="Sample" />);
        let notFound = false;
        try {
            screen.getByRole("alert");
        } catch(e) {
            notFound = true
        }

        expect(notFound).toBeTruthy()
    });
});

test('InputError should render error prop as text', () => {
    render(<InputSet error="This is a test" label="Sample" />);

    expect(screen.getByRole("alert")).toHaveTextContent("This is a test");
});

describe('when onInputText ',  () => {
    test('is not passed, we should be able to change text without error', () => {
        render(<InputSet label="Sample" />);
        fireEvent.press(screen.getByText("Sample"))
        const input = screen.getByLabelText("Sample Entry");
        fireEvent.changeText(input, 'abc')
    });

    test('is passed, it should be called when text is changed', () => {
        const onChangeMock = jest.fn();
        render(<InputSet onChangeText={onChangeMock} label="Sample" />);
        fireEvent.press(screen.getByText("Sample"))
        const input = screen.getByLabelText("Sample Entry");
        fireEvent.changeText(input, 'abc')
        expect(onChangeMock).toHaveBeenCalledTimes(1)
    });
});