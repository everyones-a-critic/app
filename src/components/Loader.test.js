import { render, screen } from '@testing-library/react-native';
import {Text} from "react-native";

import Loader from "./Loader";


jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');

describe('when loading is', () => {
    test('false, spinner should not render, but content should still render', ()=> {
        render(<Loader loading={false}><Text accessibilityRole="alert">I should render</Text></Loader>)

        let notFound = false;
        try {
            screen.getByLabelText("Loading");
        } catch(e) {
            notFound = true;
        }

        expect(notFound).toBeTruthy();

        expect(screen.getByRole("alert")).toHaveTextContent("I should render");
    });

    test('null, spinner should not render, but content should still render', ()=> {
        render(<Loader><Text accessibilityRole="alert">I should render</Text></Loader>)

        let notFound = false;
        try {
            screen.getByLabelText("Loading");
        } catch(e) {
            notFound = true;
        }

        expect(notFound).toBeTruthy();

        expect(screen.getByRole("alert")).toHaveTextContent("I should render");
    })

    test('true, content and overlay should render, 1 second later, spinner should render', ()=> {
        render(<Loader loading={true}><Text accessibilityRole="alert">I should render</Text></Loader>);
        expect(screen.getByLabelText('Content Cover').props.style.display).toBe(undefined);
        expect(screen.getByTestId('spinner')).toHaveStyle({display: 'none'});
        expect(screen.getByRole("alert")).toHaveTextContent("I should render");

        jest.advanceTimersByTime(1000);
        // // this is not possible to test, because of the issue with the testing library reported here:
        // // https://github.com/callstack/react-native-testing-library/issues/1069
        // expect(screen.getByTestId("spinner")).toHaveStyle({display: 'flex'});
    })

    test('if contentOverlay is false, overlay should not render, spinner should immediately render', ()=> {
        const screen = render(<Loader loading={true} contentOverlay={false} />);

        let notFound = false;
        try {
            screen.getByLabelText('Content Cover')
        } catch(e) {
            notFound = true;
        }

        expect(notFound).toBeTruthy();
        // expect(screen.getByTestId("spinner")).toHaveStyle({display: 'flex'});

        // // this is not possible to test, because of the issue with the testing library reported here:
        // // https://github.com/callstack/react-native-testing-library/issues/1069
        // expect(screen.getByTestId("spinner")).toHaveStyle({display: 'flex'});
    })

});