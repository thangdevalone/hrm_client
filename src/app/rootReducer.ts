
import authReducer from '@/features/auth/AuthSlice';
import { combineReducers } from 'redux';
import appReducer from './AppSlice';

const rootReducer = combineReducers({
  auth: authReducer,

  app:appReducer
  // ...other reducers
  
});

export default rootReducer;
