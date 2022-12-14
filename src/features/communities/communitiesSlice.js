import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as Sentry from 'sentry-expo';

import api from "../../api";


// TODO:
//  - Implement pagination for search results

export const getCommunity = createAsyncThunk('communities/getOne', async (data, { getState, rejectWithValue }) => {
    const allCommunities = getState().communities.all;
    const community = allCommunities.find(comm => {
        if (comm.id === data.id) {
            return comm;
        }
    });

    if(community !== undefined) {
        return community;
    } else {
        try {
            const response = await api.get(`communities/${data.id}/`)

            const community = {};
            Object.assign(community, response.data);
            community.id = community._id['$oid'];
            delete community._id;

            return community;
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

export const listMoreCommunities = createAsyncThunk('communities/list', async (data, { getState, rejectWithValue }) => {
    try {
        const url = getState().communities.allCommunitiesRequestMetadata.next
        if (url != null) {
            const response = await api.get(url)
            return {
                communities: response.data.results.map(community => {
                    community.id = community._id['$oid'];
                    delete community._id['$oid'];
                    return community;
                }),
                next: response.data.next
            }
        } else {
            return {
                communities: [],
                next: null
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
});

export const listMoreEnrolledCommunities = createAsyncThunk('communities/listEnrolled', async (data, { getState, rejectWithValue }) => {
    try {
        const url = getState().communities.enrolledCommunitiesRequestMetadata.next
        if (url != null) {
            const response = await api.get(url)
            return {
                communities: response.data.results.map(community => {
                    community.id = community._id['$oid'];
                    delete community._id['$oid'];
                    return community;
                }),
                next: response.data.next
            }
        } else {
            return {
                communities: [],
                next: null
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
});

export const searchCommunities = createAsyncThunk('communities/search', async (data, { rejectWithValue }) => {
    try {
        const response = await api.get(`communities/?searchString=${ data.searchString }`)
        return {
            communities: response.data.results.map(community => {
                community.id = community._id['$oid'];
                delete community._id['$oid'];
                return community;
            })
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

export const joinCommunity = createAsyncThunk('communities/join', async (community, { rejectWithValue }) => {
    try {
        await api.post(`communities/${community.id}/members`)
        return {
            community: community,
        }
    } catch(error) {
        if (error?.response?.status !== undefined && error?.response?.data?.message !== undefined) {
            return rejectWithValue({
                status: error.response.status,
                message: error.response.data.message,
            });
        } else {
            throw error;
        }
    }
})

export const leaveCommunity = createAsyncThunk('communities/leave', async (community, { rejectWithValue }) => {
    try {
        await api.delete(`communities/${community.id}/members`)
        return {
            community: community,
        }
    } catch(error) {
        if (error?.response?.status !== undefined && error?.response?.data?.message !== undefined) {
            return rejectWithValue({
                status: error.response.status,
                message: error.response.data.message,
            });
        } else {
            throw error;
        }
    }
})

const initialState = {
    focusedCommunity: null,
    getOneRequestMetadata: {
        status: 'idle'
    },
    all: [],
    allCommunitiesRequestMetadata: {
        next: '/communities?page=1',
        status: 'idle'
    },
    enrolled: [],
    enrolledCommunitiesRequestMetadata: {
        next: '/communities?isMember=true&page=1',
        status: 'idle'
    },
    searchResults: [],
    searchRequestMetadata: {
        status: 'idle'
    },
    joinRequestMetadata: {
        status: 'idle'
    },
    leaveRequestMetadata: {
        status: 'idle'
    },
    errors: []
}
export const communitiesSlice = createSlice({
    name: 'communities',
    initialState: initialState,
    reducers: {
        reset: () => initialState,
        resetRequestStatuses: state => {
            if (state.getOneRequestMetadata.status === 'expiredAuth') {
                state.getOneRequestMetadata.status = 'idle';
            }

            if (state.allCommunitiesRequestMetadata.status === 'expiredAuth') {
                state.allCommunitiesRequestMetadata.status = 'idle';
            }

            if (state.enrolledCommunitiesRequestMetadata.status === 'expiredAuth') {
                state.enrolledCommunitiesRequestMetadata.status = 'idle';
            }

            if (state.searchRequestMetadata.status === 'expiredAuth') {
                state.searchRequestMetadata.status = 'idle';
            }

            if (state.joinRequestMetadata.status === 'expiredAuth') {
                state.joinRequestMetadata.status = 'idle';
            }

            if (state.leaveRequestMetadata.status === 'expiredAuth') {
                state.leaveRequestMetadata.status = 'idle';
            }
        }
    },
    extraReducers(builder) {
        builder
            .addCase(listMoreCommunities.pending, (state, action) => {
                state.allCommunitiesRequestMetadata.status = 'loading';
                state.errors = [];
            })
            .addCase(listMoreCommunities.fulfilled, (state, action) => {
                state.allCommunitiesRequestMetadata.status = 'succeeded';
                state.allCommunitiesRequestMetadata.next = action.payload.next;
                action.payload.communities.forEach(newCommunity => {
                    if (state.all.findIndex(existingCommunity => existingCommunity.id === newCommunity.id) === -1) {
                        state.all.push(newCommunity)
                    }
                });
            })
            .addCase(listMoreCommunities.rejected, (state, action) => {
                state.allCommunitiesRequestMetadata.status = 'failed';
                switch(action.payload?.status) {
                    case 401:
                        state.allCommunitiesRequestMetadata.status = 'expiredAuth';
                        break;
                    default:
                        console.log("listMoreCommunities.rejected:")
                        Sentry.Native.captureException(action);
                        state.errors = [action.payload?.message || action.error.message]
                }
            })
            .addCase(listMoreEnrolledCommunities.pending, (state, action) => {
                state.enrolledCommunitiesRequestMetadata.status = 'loading';
                state.errors = [];
            })
            .addCase(listMoreEnrolledCommunities.fulfilled, (state, action) => {
                state.enrolledCommunitiesRequestMetadata.status = 'succeeded';
                state.enrolledCommunitiesRequestMetadata.next = action.payload.next;
                state.enrolled = state.enrolled.concat(action.payload.communities);
            })
            .addCase(listMoreEnrolledCommunities.rejected, (state, action) => {
                state.enrolledCommunitiesRequestMetadata.status = 'failed';
                switch(action.payload?.status) {
                    case 401:
                        state.enrolledCommunitiesRequestMetadata.status = 'expiredAuth';
                        break;
                    default:
                        console.log("listMoreEnrolledCommunities.rejected:")
                        Sentry.Native.captureException(action);
                        console.log("Here")
                        state.errors = [action.payload?.message || action.error.message]
                        console.log([action.payload?.message || action.error.message])
                }
            })
            .addCase(joinCommunity.pending, (state, action) => {
                state.errors = [];
            })
            .addCase(joinCommunity.fulfilled, (state, action) => {
                state.enrolled.push(action.payload.community)
            })
            .addCase(joinCommunity.rejected, (state, action) => {
                state.joinRequestMetadata.status = 'failed';
                switch(action.payload?.status) {
                    case 401:
                        state.joinRequestMetadata.status = 'expiredAuth';
                        break;
                    case 409:
                        state.enrolled.push(action.payload.community)
                        break;
                    default:
                        console.log("joinCommunity.rejected:")
                        Sentry.Native.captureException(action);
                        state.errors = [action.payload?.message || action.error.message]
                }
            })
            .addCase(leaveCommunity.pending, (state, action) => {
                state.errors = [];
            })
            .addCase(leaveCommunity.fulfilled, (state, action) => {
                state.enrolled = state.enrolled.filter(community => community.id !== action.payload.community.id);
            })
            .addCase(leaveCommunity.rejected, (state, action) => {
                state.leaveRequestMetadata.status = 'failed';
                switch(action.payload?.status) {
                    case 401:
                        state.leaveRequestMetadata.status = 'expiredAuth';
                        break;
                    default:
                        console.log('leaveCommunity.rejected');
                        Sentry.Native.captureException(action);
                        state.errors = [action.payload?.message || action.error.message]
                }
            })
            .addCase(searchCommunities.pending, (state, action) => {
                state.searchRequestMetadata.status = 'loading';
                state.errors = [];
            })
            .addCase(searchCommunities.fulfilled, (state, action) => {
                state.searchRequestMetadata.status = 'succeeded';
                state.searchResults = action.payload.communities;
            })
            .addCase(searchCommunities.rejected, (state, action) => {
                state.searchRequestMetadata.status = 'failed';
                switch(action.payload?.status) {
                    case 401:
                        state.searchRequestMetadata.status = 'expiredAuth';
                        break;
                    default:
                        console.log('searchCommunities.rejected')
                        Sentry.Native.captureException(action);
                        state.errors = [action.payload?.message || action.error.message]
                }
            })
            .addCase(getCommunity.pending, (state, action) => {
                state.getOneRequestMetadata.status = 'loading';
                state.errors = [];
            })
            .addCase(getCommunity.fulfilled, (state, action) => {
                state.getOneRequestMetadata.status = 'succeeded';
                state.focusedCommunity = action.payload;
                if (state.all.findIndex(existingCommunity => existingCommunity.id == action.payload.id) === -1) {
                    state.all.push(action.payload)
                }
                state.errors = [];
            })
            .addCase(getCommunity.rejected, (state, action) => {
                state.getOneRequestMetadata.status = 'failed';
                switch(action.payload?.status) {
                    case 401:
                        state.getOneRequestMetadata.status = 'expiredAuth';
                        break;
                    default:
                        console.log('getCommunity.rejected')
                        Sentry.Native.captureException(action);
                        state.errors = [action.payload?.message || action.error.message]
                }
            })
    }
});

export const { reset, resetRequestStatuses } = communitiesSlice.actions;
export default communitiesSlice.reducer;