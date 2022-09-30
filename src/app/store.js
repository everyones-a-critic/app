import { configureStore } from '@reduxjs/toolkit'
import accountReducer from "../features/account/accountSlice";
import communitiesReducer from "../features/communities/communitiesSlice";


const store = configureStore({
  reducer: {
    account: accountReducer,
    communities: communitiesReducer,
  }
});

export default store;