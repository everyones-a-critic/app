import { configureStore } from '@reduxjs/toolkit'
import accountReducer from "../features/account/accountSlice";

const store = configureStore({
  reducer: {account: accountReducer}
})

export default store;