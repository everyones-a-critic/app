import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import api from "../../api";


// TODO:
//  - Get One Community
//  - Implement pagination for search results

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

export const communitiesSlice = createSlice({
    name: 'communities',
    initialState: {
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
        errors: [],
        validSession: true
    },
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(listMoreCommunities.pending, (state, action) => {
                state.allCommunitiesRequestMetadata.status = 'loading';
                state.errors = [];
            })
            .addCase(listMoreCommunities.fulfilled, (state, action) => {
                state.allCommunitiesRequestMetadata.status = 'succeeded';
                state.allCommunitiesRequestMetadata.next = action.payload.next;
                state.all = state.all.concat(action.payload.communities);
            })
            .addCase(listMoreCommunities.rejected, (state, action) => {
                state.allCommunitiesRequestMetadata.status = 'failed';
                switch(action.payload?.status) {
                    case 401:
                        state.allCommunitiesRequestMetadata.status = 'expiredAuth';
                        break;
                    default:
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
                        state.errors = [action.payload?.message || action.error.message]
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
                console.log(action.payload)
                switch(action.payload?.status) {
                    case 401:
                        state.joinRequestMetadata.status = 'expiredAuth';
                        break;
                    case 409:
                        state.enrolled.push(action.payload.community)
                        break;
                    default:
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
                        state.errors = [action.payload?.message || action.error.message]
                }
            })
    }
});

export default communitiesSlice.reducer;