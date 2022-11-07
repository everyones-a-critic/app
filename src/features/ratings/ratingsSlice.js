import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import api from "../../api";


export const getMostRecentRating = createAsyncThunk('ratings/getMostRecent', async ({ productId }, { getState, rejectWithValue }) => {
    const mostRecentRating = getState().ratings.mostRecentRatings[productId];
    if (mostRecentRating !== undefined && mostRecentRating !== null) {
        return {
            productId: productId,
            rating: mostRecentRating
        }
    } else {
        try {
            const response = await api.get(`/products/${productId}/ratings/?mostRecent=true`);
            if (response.data.results.length > 0) {
                const ratingObject = response.data.results[0]
                ratingObject.roundedRating = Math.ceil(ratingObject.rating);
                return {
                    rating: ratingObject
                }
            } else {
                return {
                    rating: null
                }
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
    }
});

export const createOrUpdateRating = createAsyncThunk('ratings/createOrUpdate', async ({ rating, comments, productId }, { getState, rejectWithValue }) => {
    // logic implemented on the API side. if over 24 hours old, creates a new one, otherwise updates. This allows us to
    // track history and see how a user's tastes are changing over time
    try {
        const post_data = { rating };
        if (comments !== undefined) {
            post_data.comments = comments;
        }
        const response = await api.post(`/products/${productId}/ratings/`, post_data);
        const ratingObject = response.data
        ratingObject.roundedRating = Math.ceil(ratingObject.rating);
        return {
            rating: ratingObject
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

export const archiveRating = createAsyncThunk('ratings/archive', async ({ productId, ratingId }, { getState, rejectWithValue }) => {
    try {
        const patch_data = { archived: true };
        await api.patch(`/products/${productId}/ratings/${ratingId}/`, patch_data);
        return {}
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

export const updateRating = createAsyncThunk('ratings/update', async ({ productId, ratingId, data }, { getState, rejectWithValue }) => {
    try {
        const response = await api.patch(`/products/${productId}/ratings/${ratingId}/`, data);
        const ratingObject = response.data;
        ratingObject.roundedRating = Math.ceil(ratingObject.rating);
        return {
            rating: ratingObject
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

const initialState = {
    mostRecentRatings: {},
    // goal with requestMetadata and error maps: only allow one request per product rating
    requestMetadata: {},
    errors: {},
}
export const ratingsSlice = createSlice({
    name: 'ratings',
    initialState: initialState,
    reducers: {
        reset: () => initialState,
        resetRequestStatuses: state => {
            for (const key in state.requestMetadata) {
                if (state.requestMetadata[key]?.status === "expiredAuth"){
                    state.requestMetadata[key].status = 'idle';
                };
            }
        }
    },
    extraReducers(builder) {
        builder
            .addCase(getMostRecentRating.pending, (state, action) => {
                let productRequestMetadata = state.requestMetadata[action.meta.arg.productId]
                if (productRequestMetadata === undefined) {
                    productRequestMetadata = { status: 'loading' };
                } else {
                    productRequestMetadata.status = 'loading';
                }
                state.requestMetadata[action.meta.arg.productId] = productRequestMetadata;
                state.errors[action.meta.arg.productId] = [];
            })
            .addCase(getMostRecentRating.fulfilled, (state, action) => {
                const productId = action.meta.arg.productId;
                state.requestMetadata[productId].status = 'succeeded';
                state.mostRecentRatings[productId] = action.payload.rating;
                state.errors[productId] = [];
            })
            .addCase(getMostRecentRating.rejected, (state, action) => {
                console.log('getMostRecentRating.rejected: ')
                const productId = action.meta.arg.productId;
                let status = 'failed';
                let errors = [];
                switch(action.payload?.status) {
                    case 401:
                        status = 'expiredAuth';
                        break;
                    default:
                        errors = [action.payload?.message || action.error.message]
                }
                console.log(errors);
                state.requestMetadata[productId].status = status;
                state.errors[productId] = errors;
            })
            .addCase(createOrUpdateRating.pending, (state, action) => {
                let productRequestMetadata = state.requestMetadata[action.meta.arg.productId]
                if (productRequestMetadata === undefined) {
                    productRequestMetadata = { status: 'loading' };
                } else {
                    productRequestMetadata.status = 'loading';
                }
                state.requestMetadata[action.meta.arg.productId] = productRequestMetadata;
                state.errors[action.meta.arg.productId] = [];
            })
            .addCase(createOrUpdateRating.fulfilled, (state, action) => {
                const productId = action.meta.arg.productId;
                state.requestMetadata[productId].status = 'succeeded';
                state.mostRecentRatings[productId] = action.payload.rating;
                state.errors[productId] = [];
            })
            .addCase(createOrUpdateRating.rejected, (state, action) => {
                console.log('createOrUpdateRating.rejected: ')
                const productId = action.meta.arg.productId;
                let status = 'failed';
                let errors = [];
                switch(action.payload?.status) {
                    case 401:
                        status = 'expiredAuth';
                        break;
                    default:
                        errors = [action.payload?.message || action.error.message]
                }
                console.log(errors);
                state.requestMetadata[productId].status = status;
                state.errors[productId] = errors;
            })
            .addCase(archiveRating.pending, (state, action) => {
                let productRequestMetadata = state.requestMetadata[action.meta.arg.productId]
                if (productRequestMetadata === undefined) {
                    productRequestMetadata = { status: 'loading' };
                } else {
                    productRequestMetadata.status = 'loading';
                }

                state.requestMetadata[action.meta.arg.productId] = productRequestMetadata;
                state.errors[action.meta.arg.productId] = [];
            })
            .addCase(archiveRating.fulfilled, (state, action) => {
                const productId = action.meta.arg.productId;
                state.requestMetadata[productId].status = 'succeeded';
                delete state.mostRecentRatings[productId];
                state.errors[productId] = [];
            })
            .addCase(archiveRating.rejected, (state, action) => {
                console.log('archiveRating.rejected: ')
                const productId = action.meta.arg.productId;
                let status = 'failed';
                let errors = [];
                switch(action.payload?.status) {
                    case 401:
                        status = 'expiredAuth';
                        break;
                    default:
                        errors = [action.payload?.message || action.error.message]
                }
                console.log(errors);
                state.requestMetadata[productId].status = status;
                state.errors[productId] = errors;
            })
            .addCase(updateRating.pending, (state, action) => {
                let productRequestMetadata = state.requestMetadata[action.meta.arg.productId]
                if (productRequestMetadata === undefined) {
                    productRequestMetadata = { status: 'loading' };
                } else {
                    productRequestMetadata.status = 'loading';
                }
                state.requestMetadata[action.meta.arg.productId] = productRequestMetadata;
                state.errors[action.meta.arg.productId] = [];
            })
            .addCase(updateRating.fulfilled, (state, action) => {
                const productId = action.meta.arg.productId;
                state.requestMetadata[productId].status = 'succeeded';
                state.mostRecentRatings[productId] = action.payload.rating;
                state.errors[productId] = [];
            })
            .addCase(updateRating.rejected, (state, action) => {
                console.log('updateRating.rejected: ')
                const productId = action.meta.arg.productId;
                let status = 'failed';
                let errors = [];
                switch(action.payload?.status) {
                    case 401:
                        status = 'expiredAuth';
                        break;
                    default:
                        errors = [action.payload?.message || action.error.message]
                }
                console.log(errors);
                state.requestMetadata[productId].status = status;
                state.errors[productId] = errors;
            });
    }
});

export const { reset, resetRequestStatuses } = ratingsSlice.actions;
export default ratingsSlice.reducer;