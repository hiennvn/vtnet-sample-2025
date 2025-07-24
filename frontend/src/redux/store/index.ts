import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Import reducers
import userReducer from '../slices/userSlice';
import roleReducer from '../slices/roleSlice';
import authReducer from '../slices/authSlice';
import projectReducer from '../slices/projectSlice';
import projectMemberReducer from '../slices/projectMemberSlice';
import documentReducer from '../slices/documentSlice';
import folderReducer from '../slices/folderSlice';
import chatReducer from '../slices/chatSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    roles: roleReducer,
    projects: projectReducer,
    projectMembers: projectMemberReducer,
    documents: documentReducer,
    folders: folderReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 