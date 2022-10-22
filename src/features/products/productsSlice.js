import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import api from "../../api";


export const getProduct = createAsyncThunk('products/getOne', async (data, { getState, rejectWithValue }) => {
    const allProducts = getState().products.all;
    const product = allProducts.find(prod => {
        if (prod.id === data.id) {
            return prod;
        }
    });

    if(product !== undefined) {
        return product;
    } else {
        try {
            const response = await api.get(`products/${data.id}/`)
            return response.data;
        } catch(error) {
            if (error?.response?.status !== undefined && error?.response?.data?.message !== undefined) {
                return rejectWithValue({
                    status: error.response.status,
                    message: error.response.data.message
                });
            } else {
                throw error;
            }
        }
    }
});

export const listMoreProducts = createAsyncThunk('products/list', async (data, { getState, rejectWithValue }) => {
    let requestMetadata = getState().products.allByCommunityRequestMetadata[data.communityId];
    let url = requestMetadata.next;
    if (url === undefined) {
        url = `/products?page=1&size=5&communityId=${data.communityId}`;
    } else if (url === null) {
        return {
            products: [],
            communityFilter: data.communityId,
            next: null
        }
    }

    try {
        console.log("Called with this url: ", url)
        const response = await api.get(url)
        return {
            products: response.data.results,
            communityFilter: data.communityId,
            next: response.data.next
        }
    } catch(error) {
        if (error?.response?.status !== undefined && error?.response?.data?.message !== undefined) {
            return rejectWithValue({
                status: error.response.status,
                message: error.response.data.message
            });
        } else {
            throw error;
        }
    }
});

export const listMoreProductsWithRatings = createAsyncThunk('products/listWithRatings', async (data, { getState, rejectWithValue }) => {
    let requestMetadata = getState().products.allWithRatingsByCommunityRequestMetadata[data.communityId];
    let url = requestMetadata.next;
    if (url === undefined) {
        url = `/products?page=1&size=5&communityId=${data.communityId}&withRatings=true`;
    } else if (url === null) {
        return {
            products: [],
            communityFilter: data.communityId,
            next: null
        }
    }

    try {
        const response = await api.get(url)
        return {
            products: response.data.results,
            communityFilter: data.communityId,
            next: response.data.next
        }
    } catch(error) {
        if (error?.response?.status !== undefined && error?.response?.data?.message !== undefined) {
            return rejectWithValue({
                status: error.response.status,
                message: error.response.data.message
            });
        } else {
            throw error;
        }
    }
});


export const productsSlice = createSlice({
    name: 'products',
    initialState: {
        focusedProduct: null,
        getOneRequestMetadata: {
            status: 'idle'
        },
        all: [],
        allByCommunity: {},
        allByCommunityRequestMetadata: {},
        allWithRatingsByCommunity: {},
        allWithRatingsByCommunityRequestMetadata: {},
        errors: [],
        validSession: true
    },
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(listMoreProducts.pending, (state, action) => {
                const communityId = action.meta.arg.communityId;
                let requestMetadata = state.allByCommunityRequestMetadata[communityId] || {};
                requestMetadata.status = 'loading';
                state.allByCommunityRequestMetadata[communityId] = requestMetadata;
                state.errors = [];
            })
            .addCase(listMoreProducts.fulfilled, (state, action) => {
                const communityId = action.payload.communityFilter;
                const requestMetadata = {
                    status: 'succeeded',
                    next: action.payload.next,
                };
                state.allByCommunityRequestMetadata[communityId] = requestMetadata;

                let currentProducts = state.allByCommunity[communityId];
                if (currentProducts === undefined) {
                    currentProducts = [];
                }
                state.allByCommunity[communityId] = currentProducts.concat(action.payload.products);
                state.all.concat(action.payload.products);
            })
            .addCase(listMoreProducts.rejected, (state, action) => {
                const communityId = action.meta.arg.communityId;
                let requestMetadata = state.allByCommunityRequestMetadata[communityId];
                requestMetadata.status = 'failed'
                switch(action.payload?.status) {
                    case 401:
                        console.log("expiredAuth")
                        requestMetadata.status = 'expiredAuth'
                        break;
                    default:
                        console.log("error")
                        console.log(action.payload)
                        console.log(action.error)
                        state.errors = [action.payload?.message || action.error.message]
                }
                state.allByCommunityRequestMetadata[communityId] = requestMetadata;
            })
            .addCase(getProduct.pending, (state, action) => {
                state.getOneRequestMetadata.status = 'loading';
                state.errors = [];
            })
            .addCase(getProduct.fulfilled, (state, action) => {
                state.getOneRequestMetadata.status = 'succeeded';
                state.focusedProduct = action.payload;
                if (state.all.findIndex(x => x.id == action.payload.id) === -1) {
                    state.all.push(action.payload)
                }
                state.errors = [];
            })
            .addCase(getProduct.rejected, (state, action) => {
                state.getOneRequestMetadata.status = 'failed';
                switch(action.payload?.status) {
                    case 401:
                        state.getOneRequestMetadata.status = 'expiredAuth';
                        break;
                    default:
                        state.errors = [action.payload?.message || action.error.message]
                }
            })
            .addCase(listMoreProductsWithRatings.pending, (state, action) => {
                const communityId = action.meta.arg.communityId;
                let requestMetadata = state.allWithRatingsByCommunityRequestMetadata[communityId] || {};
                requestMetadata.status = 'loading';
                state.allWithRatingsByCommunityRequestMetadata[communityId] = requestMetadata;
                state.errors = [];
            })
            .addCase(listMoreProductsWithRatings.fulfilled, (state, action) => {
                const communityId = action.payload.communityFilter;
                const requestMetadata = {
                    status: 'succeeded',
                    next: action.payload.next,
                };
                state.allWithRatingsByCommunityRequestMetadata[communityId] = requestMetadata;

                let currentProducts = state.allWithRatingsByCommunity[communityId];
                if (currentProducts === undefined) {
                    currentProducts = [];
                }
                state.allWithRatingsByCommunity[communityId] = currentProducts.concat(action.payload.products);
            })
            .addCase(listMoreProductsWithRatings.rejected, (state, action) => {
                const communityId = action.meta.arg.communityId;
                let requestMetadata = state.allWithRatingsByCommunity[communityId];
                requestMetadata.status = 'failed'
                switch(action.payload?.status) {
                    case 401:
                        console.log("expiredAuth")
                        requestMetadata.status = 'expiredAuth'
                        break;
                    default:
                        console.log("error")
                        console.log(action.payload)
                        console.log(action.error)
                        state.errors = [action.payload?.message || action.error.message]
                }
                state.allWithRatingsByCommunity[communityId] = requestMetadata;
            })
    }
});

export default productsSlice.reducer;