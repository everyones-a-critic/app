import axios from 'axios';
import { setItemAsync, getItemAsync } from 'expo-secure-store';
import {
    CognitoIdentityProviderClient,
    InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import { COGNITO_CLIENT_ID, COGNITO_REGION, COGNITO_USER_POOL_ID } from "react-native-dotenv";


const api = axios.create({
	baseURL: 'https://api.everyonesacriticapp.com',
});

api.interceptors.request.use(async config => {
    config.headers.Authorization = await getItemAsync('IdentityToken');
    if (config.headers.retries === undefined) {
        config.headers.retries = 0
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});

api.interceptors.response.use(response => response, async error => {
    if (error.response.status === 401) {
        const input = {
            ClientId: COGNITO_CLIENT_ID,
            UserPoolId: COGNITO_USER_POOL_ID,
            AuthFlow: "REFRESH_TOKEN_AUTH",
            AuthParameters: {
                REFRESH_TOKEN: await getItemAsync('RefreshToken'),
            }
        };

        const client = new CognitoIdentityProviderClient({
            region: COGNITO_REGION,
        });
        const command = new InitiateAuthCommand(input);
        try {
            const response = await client.send(command);

            // Object {
            //   "$metadata": Object {
            //     "attempts": 1,
            //     "cfId": undefined,
            //     "extendedRequestId": undefined,
            //     "httpStatusCode": 200,
            //     "requestId": "cac1bcd3-fff0-4ccc-8523-870143186574",
            //     "totalRetryDelay": 0,
            //   },
            //   "AuthenticationResult": Object {
            //     "AccessToken": "...",
            //     "ExpiresIn": 3600,
            //     "IdToken": "...",
            //     "NewDeviceMetadata": undefined,
            //     "RefreshToken": undefined,
            //     "TokenType": "Bearer",
            //   },
            //   "ChallengeName": undefined,
            //   "ChallengeParameters": Object {},
            //   "Session": undefined,
            // }

            await setItemAsync("IdentityToken", response.AuthenticationResult.IdToken);

            if (error.config.headers.retries === 0) {
                error.config.headers.retries = 1;
                delete error.config.headers.Authorization;
                return await api.request(error.config);
            } else {
                return error;
            }
        } catch (e) {
            return error;
        }
    } else {
        return error;
    }
});

export default api;
