import axios from 'axios';
import { setItemAsync, getItemAsync } from 'expo-secure-store';
import {
    CognitoIdentityProviderClient,
    InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";


const sleep = ms => {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

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
    if (error.response?.status === 401) {
        const input = {
            ClientId: process.env.COGNITO_CLIENT_ID,
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            AuthFlow: "REFRESH_TOKEN_AUTH",
            AuthParameters: {
                REFRESH_TOKEN: await getItemAsync('RefreshToken') || "_",
            }
        };

        const client = new CognitoIdentityProviderClient({
            region: process.env.COGNITO_REGION,
        });
        const command = new InitiateAuthCommand(input);
        let response;
        try {
            response = await client.send(command);

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
        } catch (e) {
            if (e?.name === "NotAuthorizedException") {
                throw error;
            } else {
                throw e;
            }
        }

        await setItemAsync("IdentityToken", response.AuthenticationResult.IdToken);

        if (error.config.headers.retries === 0) {
            error.config.headers.retries = 1;
            delete error.config.headers.Authorization;
            return await api.request(error.config);
        } else {
            throw error;
        }
    } else if (error.response?.status === 500) {
        // retry 500 errors as there seems to be intermittent 500 errors from lambda
        console.log("Received a 500 error:")
        console.log(error.config)
        if (error.config.headers.retries === 0) {
            console.log("hitting retry")
            error.config.headers.retries = 1;
            await sleep(1000);
            return await api.request(error.config);
        } else {
            console.log("retried once. returning")
            throw error;
        }
    } else {
        throw error;
    }
});

export default api;
