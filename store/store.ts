// store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import friendsReducer from "./friendsSlice"
import chatReducer from "./chatSlice"

const store = configureStore({ //Redux Toolkit에서 제공하는 스토어 생성 함수
  reducer: { //configureStore에 객체 형태로 전달하여, 스토어에서 사용할 리듀서를 등록합니다.
    friends: friendsReducer, 
    chat: chatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>; //스토어의 전체 상태에 대한 타입 
//ReturnType<typeof store.getState>를 통해 스토어의 getState()가 반환하는 타입(전체 상태)을 추론하여 가져옵니다.
//컴포넌트에서 useSelector((state: RootState) => state.friends ...)처럼 사용 가능합니다.
export type AppDispatch = typeof store.dispatch;
//store.dispatch 함수의 타입입니다.
//비동기 Thunk 등을 작성할 때 타입 안정성을 높이기 위해 사용합니다.
export default store;
//생성한 스토어 인스턴스를 모듈의 기본값으로 내보냅니다.
//React에서 Provider 컴포넌트로 이 스토어를 감싸주면 전역에서 Redux 상태 사용이 가능해집니다.