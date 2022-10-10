import { configureStore } from '@reduxjs/toolkit'
import accountReducer from "../features/account/accountSlice";
import communitiesReducer from "../features/communities/communitiesSlice";
import productsReducer from "../features/products/productsSlice";


const store = configureStore({
    reducer: {
        account: accountReducer,
        communities: communitiesReducer,
        products: productsReducer
    }
});

export default store;