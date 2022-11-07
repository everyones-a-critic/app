import api from "./index";
import axios from "axios";
import { setItemAsync } from 'expo-secure-store';
import { mockClient } from 'aws-sdk-client-mock';
import { CognitoIdentityProviderClient, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
const cognitoMock = mockClient(CognitoIdentityProviderClient);

beforeEach(() => {
    cognitoMock.reset();
});

test("When a request is submitted it has a valid Authorization header, and retries header", async () => {
    const config = await api.interceptors.request.handlers[0].fulfilled({ headers: {} });
    expect(config.headers.Authorization).toBe('SomeToken');
    expect(config.headers.retries).toBe(0);
});

test("When a request with retries specified, it should not be overridden", async () => {
    const config = await api.interceptors.request.handlers[0].fulfilled({ headers: {retries: 1} });
    expect(config.headers.retries).toBe(1);
});

test("When a 401 response is received the token is refreshed", async () => {
    cognitoMock.on(InitiateAuthCommand).resolves({
        AuthenticationResult: {
            IdToken: "Test AccessToken",
            RefreshToken: "Test RefreshToken",
            TokenType: "Bearer"
        }
    });

    axios.request.mockResolvedValueOnce({data: 'test'});

    const error = {
      config: {
        headers: {
          Authorization: 'SomeWrongToken',
          retries: "0",
        },
        baseURL: 'https://www.example.com',
        method: 'get',
        url: '/test',
      },
      response: {
        status: 401,
      }
    }
    const response = await api.interceptors.response.handlers[0].rejected(error);
    expect(setItemAsync).toHaveBeenCalledWith("IdentityToken", "Test AccessToken");
    expect(axios.request).toHaveBeenCalledWith({
        "baseURL": "https://www.example.com",
        "headers": {
            "retries": 1
        },
        "method": "get",
        "url": "/test",
    })
    expect(response.data).toBe('test')
});

test("When two 401 responses in a row are received, the 401 is returned", async () => {
    // really, we just want to make sure we don't get stuck in a loop
    cognitoMock.on(InitiateAuthCommand).resolves({
        AuthenticationResult: {
            IdToken: "Test AccessToken",
            RefreshToken: "Test RefreshToken",
            TokenType: "Bearer"
        }
    });
    const error = {
      config: {
        headers: {
          Authorization: 'SomeWrongToken',
          retries: "0",
        },
        baseURL: 'https://www.example.com',
        method: 'get',
        url: '/test',
      },
      response: {
        status: 401,
      }
    }

    axios.request.mockResolvedValueOnce(error);

    const request_error = await api.interceptors.response.handlers[0].rejected(error);
    expect(request_error.response.status).toBe(401)
});

test("A non 401 error response is returned", async () => {

    const error = {
      response: {
        status: 403,
      }
    }

    let request_error;
    try {
        await api.interceptors.response.handlers[0].rejected(error);
    } catch (e) {
        request_error = e
    }

    expect(request_error.response.status).toBe(403)
});