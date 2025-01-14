// global.d.ts (또는 react-long-press.d.ts 등)
declare module 'react-long-press' {
    import * as React from 'react';
  
    // 필요에 맞게 간단히 선언
    // 예: useLongPress 함수 형태를 간단히 정의
    export interface UseLongPressOptions {
      threshold?: number;
      captureEvent?: boolean;
      // ...
    }
  
    export function useLongPress(
      callback: (event?: any) => void,
      options?: UseLongPressOptions
    ): {
      // bind props 예시
      onMouseDown: React.MouseEventHandler;
      onMouseUp: React.MouseEventHandler;
      onTouchStart: React.TouchEventHandler;
      onTouchEnd: React.TouchEventHandler;
    };
  
    export enum LongPressDetectEvents {
      MOUSE = 'MOUSE',
      TOUCH = 'TOUCH',
      BOTH = 'BOTH',
    }
  }
  