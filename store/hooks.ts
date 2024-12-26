// store/hooks.ts
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { AppDispatch, RootState } from './store';

// 커스텀 디스패치 훅
export const useAppDispatch: () => AppDispatch = useDispatch;

// 커스텀 셀렉터 훅
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;