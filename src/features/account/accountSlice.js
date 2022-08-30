import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {COGNITO_CLIENT_ID, COGNITO_REGION, COGNITO_USER_POOL_ID} from "react-native-dotenv";
import {CognitoIdentityProviderClient, SignUpCommand, ConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";


export const signUp = createAsyncThunk('account/signUp', async formData => {
    const input = {
        ClientId: COGNITO_CLIENT_ID,
        UserPoolId: COGNITO_USER_POOL_ID,
        Password: formData.password,
        Username: formData.email,
        UserAttributes: [{
            Name: "email",
            Value: formData.email
        }],
    };

    const client = new CognitoIdentityProviderClient({
        region: COGNITO_REGION,
    });

    const command = new SignUpCommand(input);
    const response = await client.send(command);

    return {
        email: formData.email,
        userStatus: response.UserConfirmed
    };
});

export const confirm = createAsyncThunk('account/confirm', async formData => {
    const input = {
        ClientId: COGNITO_CLIENT_ID,
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: formData.email,
        ConfirmationCode: formData.confirmationCode,
    };

    const client = new CognitoIdentityProviderClient({
        region: COGNITO_REGION,
    });

    const command = new ConfirmSignUpCommand(input);
    const response = await client.send(command);

    return {
        email: formData.email,
        userStatus: response.UserConfirmed
    };
});

export const accountSlice = createSlice({
    name: 'account',
    initialState: {
        email: null,
        userStatus: null,
        status: 'idle',
        errors: {
            fields: {},
            form: []
        },
    },
    reducers: {
        resetErrors: state => {
            state.errors = {
                fields: {},
                form: []
            }
        }
    },
    extraReducers(builder) {
        // omit posts loading reducers
        builder
            .addCase(signUp.pending, (state, action) => {
                state.status = 'loading';
                state.errors = {
                    fields: {},
                    form: []
                }
            })
            .addCase(signUp.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.email = action.payload.email;
                state.userStatus = action.payload.userStatus;
            })
            .addCase(signUp.rejected, (state, action) => {
                state.status = 'failed';
                switch (action.error.name) {
                    case 'InvalidPasswordException':
                        state.errors.fields.password = [
                            action.error.message
                        ];
                        break;
                    case 'UsernameExistsException':
                        state.errors.fields.email = [
                            'A user is already registered with that email address. Please sign in.'
                        ];
                        break;
                    case 'InvalidParameterException':
                        if (action.error.message.includes("password")) {
                            state.errors.fields.password = [
                                "Invalid password. Your password must include 1 uppercase character, 1 lowercase " +
                                "character, a number and 1 special character. It must also contain at least 8 " +
                                "characters. "
                            ];
                        } else if (action.error.message.includes("email")) {
                            state.errors.fields.email = [
                                action.error.message
                            ];
                        } else {
                            state.errors.form = [
                                action.error.message
                            ];
                        }
                        break;
                    default:
                        state.errors.form = [
                            action.error.message
                        ];
                }
            })
            .addCase(confirm.pending, (state, action) => {
                state.status = 'loading';
                state.errors = {
                    fields: {},
                    form: []
                }
            })
            .addCase(confirm.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.email = action.payload.email;
                state.userStatus = action.payload.userStatus;
            })
            .addCase(confirm.rejected, (state, action) => {
                state.status = 'failed';
                switch (action.error.name) {
                    case 'ExpiredCodeException':
                        state.errors.fields.confirmationCode = [
                            "The code provided is invalid or has expired. Please login again and a new code will be " +
                            "sent to your email."
                        ]
                        break;
                    default:
                        state.errors.form = [
                            action.error.message
                        ];
                }
            });
    }
});

export const { resetErrors } = accountSlice.actions;

export default accountSlice.reducer;