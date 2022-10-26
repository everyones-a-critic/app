import { render, screen } from '@testing-library/react-native';

import InputError from "./InputError";

describe('InputError should not render when error is', () => {
    test('null', () => {
        const errorElement = render(
            <InputError error={null} inputLabel="Email" />
        );
        expect(errorElement.toJSON()).toBeNull();
    });

    test('undefined', () => {
        const errorElement = render(
            <InputError error={undefined} inputLabel="Email" />
        );
        expect(errorElement.toJSON()).toBeNull();
    });

    test('an empty string', () => {
        const errorElement = render(
            <InputError error="" inputLabel="Email" />
        );
        expect(errorElement.toJSON()).toBeNull();
    });
});

test('InputError should render error prop as text', () => {
    render(
        <InputError error="Email is a required field." inputLabel="Email" />
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Email is a required field.")
});