import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
    CognitoIdentityProviderClient,
    SignUpCommand,
    ConfirmSignUpCommand,
    InitiateAuthCommand,
    ResendConfirmationCodeCommand
} from "@aws-sdk/client-cognito-identity-provider";
import { setItemAsync } from 'expo-secure-store';


export const signUp = createAsyncThunk('account/signUp', async formData => {
    const email = formData.email.trim();
    const input = {
        ClientId: process.env.COGNITO_CLIENT_ID,
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        // Password: formData.password,
        Password: "Test1234%",
        Username: email,
        UserAttributes: [
            { Name: "email", Value: email }
        ],
    };

    const client = new CognitoIdentityProviderClient({
        region: process.env.COGNITO_REGION,
    });

    const command = new SignUpCommand(input);
    await client.send(command);

    // Object {
    //   "$metadata": Object {
    //     "attempts": 1,
    //     "cfId": undefined,
    //     "extendedRequestId": undefined,
    //     "httpStatusCode": 200,
    //     "requestId": "8c6da7a1-da82-4514-b8e9-b4e64c4765a7",
    //     "totalRetryDelay": 0,
    //   },
    //   "CodeDeliveryDetails": Object {
    //     "AttributeName": "email",
    //     "DeliveryMedium": "EMAIL",
    //     "Destination": "2***@g***",
    //   },
    //   "UserConfirmed": false,
    //   "UserSub": "fb6f0474-4836-403f-aa8e-b05bacdeb28a",
    // }

    return {
        email: email,
        confirmed: false
    };
});

export const confirm = createAsyncThunk('account/confirm', async formData => {
    const email = formData.email.trim();
    const input = {
        ClientId: process.env.COGNITO_CLIENT_ID,
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: email,
        ConfirmationCode: formData.confirmationCode,
    };

    const client = new CognitoIdentityProviderClient({
        region: process.env.COGNITO_REGION,
    });

    const command = new ConfirmSignUpCommand(input);
    await client.send(command);

    // Object {
    //     "$metadata": Object {
    //     "attempts": 1,
    //     "cfId": undefined,
    //     "extendedRequestId": undefined,
    //     "httpStatusCode": 200,
    //     "requestId": "ec2c7659-524e-4450-8b0d-2d37130658c1",
    //     "totalRetryDelay": 0,
    // }

    return { email: formData.email };
});

export const signIn = createAsyncThunk('account/signIn', async formData => {
    const email = formData.email.trim()
    const input = {
        ClientId: process.env.COGNITO_CLIENT_ID,
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: {
            USERNAME: email,
            PASSWORD: formData.password
        }
    }

    const client = new CognitoIdentityProviderClient({
        region: process.env.COGNITO_REGION,
    });
    const command = new InitiateAuthCommand(input);
    const response = await client.send(command);

    // "$metadata": Object {
    //     "attempts": 1,
    //     "cfId": undefined,
    //     "extendedRequestId": undefined,
    //     "httpStatusCode": 200,
    //     "requestId": "e3711ee6-bb97-49b8-ba04-69f2e1c3b669",
    //     "totalRetryDelay": 0,
    // },
    // "AuthenticationResult": Object {
    //     "AccessToken": "eyJraWQiOiJ3Q2FkWHZ0aHFyVlU3VlwvVHhjY...",
    //     "ExpiresIn": 3600,
    //     "IdToken": "eyJraWQiOiJlOERIcHFyMjFBcXZQVVBVcStHcFdj...",
    //     "NewDeviceMetadata": undefined,
    //     "RefreshToken": "eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIi...",
    //     "TokenType": "Bearer",
    // },
    //     "ChallengeName": undefined,
    //     "ChallengeParameters": Object {},
    //     "Session": undefined,
    // }

    await setItemAsync("IdentityToken", response.AuthenticationResult.IdToken);
    await setItemAsync("RefreshToken", response.AuthenticationResult.RefreshToken);

    return {
        email: formData.email,
        loggedIn: true,
    };
});

export const sendConfirmationCode = createAsyncThunk('account/sendConfirmationCode', async formData => {
    const input = {
        ClientId: process.env.COGNITO_CLIENT_ID,
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: formData.email
    }

    const client = new CognitoIdentityProviderClient({
        region: process.env.COGNITO_REGION,
    });

    const command = new ResendConfirmationCodeCommand(input);
    const response = await client.send(command);

    // "$metadata": Object {
    //     "attempts": 1,
    //     "cfId": undefined,
    //     "extendedRequestId": undefined,
    //     "httpStatusCode": 200,
    //     "requestId": "85703b82-78bd-4eb8-961f-16df4896d539",
    //     "totalRetryDelay": 0,
    // },
    //     "CodeDeliveryDetails": Object {
    //     "AttributeName": "email",
    //     "DeliveryMedium": "EMAIL",
    //     "Destination": "2***@g***",
    // },

    // return {
    //     email: formData.email,
    // };
});

export const signOut = createAsyncThunk('account/signOut', async () => {
    await deleteItemAsync("IdentityToken");
    await deleteItemAsync("RefreshToken");

    return {
        loggedIn: false,
    };
});

export const accountSlice = createSlice({
    name: 'account',
    initialState: {
        email: null,
        confirmed: false,
        requestStatus: 'idle',
        loggedIn: false,
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
                state.requestStatus = 'loading';
                state.errors = {
                    fields: {},
                    form: []
                }
            })
            .addCase(signUp.fulfilled, (state, action) => {
                state.requestStatus = 'succeeded';
                state.email = action.payload.email;
                state.confirmed = action.payload.confirmed;
            })
            .addCase(signUp.rejected, (state, action) => {
                state.requestStatus = 'failed';
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
                state.requestStatus = 'loading';
                state.errors = {
                    fields: {},
                    form: []
                }
            })
            .addCase(confirm.fulfilled, (state, action) => {
                state.requestStatus = 'succeeded';
                state.email = action.payload.email;
            })
            .addCase(confirm.rejected, (state, action) => {
                state.requestStatus = 'failed';
                switch (action.error.name) {
                    case 'ExpiredCodeException':
                        state.errors.fields.confirmationCode = [
                            "The code provided is invalid or has expired. Please login again and a new code will be " +
                            "sent to your email."
                        ]
                        // TODO - Give the user an easier way to regenerate code
                        break;
                    default:
                        state.errors.form = [
                            action.error.message
                        ];
                }
            })
            .addCase(signIn.pending, (state, action) => {
                state.requestStatus = 'loading';
                state.errors = {
                    fields: {},
                    form: []
                }
            })
            .addCase(signIn.fulfilled, (state, action) => {
                state.requestStatus = 'succeeded';
                state.confirmed = true;
                state.email = action.payload.email;
                state.loggedIn = action.payload.loggedIn;
            })
            .addCase(signIn.rejected, (state, action) => {
                state.requestStatus = 'failed';
                switch (action.error.name) {
                    case 'NotAuthorizedException':
                        state.errors.form = [
                            action.error.message
                        ];
                        break;
                    case 'UserNotConfirmedException':
                        state.requestStatus = 'succeeded';
                        state.email = action.meta.arg.email;
                        state.confirmed = false;
                        break;
                    default:
                        state.errors.form = [
                            action.error.message
                        ];
                }
            })
            .addCase(signOut.pending, (state, action) => {
                state.requestStatus = 'loading';
            })
            .addCase(signOut.fulfilled, (state, action) => {
                state.requestStatus = 'succeeded';
                state.confirmed = true;
                state.email = action.payload.email;
                state.loggedIn = action.payload.loggedIn;
            })
    }
});

export const { resetErrors } = accountSlice.actions;

export default accountSlice.reducer;