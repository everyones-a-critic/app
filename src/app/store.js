import { configureStore } from '@reduxjs/toolkit'
import accountReducer from "../features/account/accountSlice";
import communitiesReducer from "../features/communities/communitiesSlice";
import productsReducer from "../features/products/productsSlice";
import ratingsReducer from "../features/ratings/ratingsSlice";


const store = configureStore({
    reducer: {
        account: accountReducer,
        communities: communitiesReducer,
        products: productsReducer,
        ratings: ratingsReducer
    }
});

export default store;