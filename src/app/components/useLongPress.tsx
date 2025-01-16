// useLongPress.ts
'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

interface UseLongPressOptions {
  threshold?: number; // 길게 누르기 인식 시간(ms)
}

/**
 * 길게 누름을 감지하는 커스텀 훅
 * @param callback 길게 눌렀을 때 실행할 함수
 * @param options threshold: 길게 누르는 시간 (기본값 500ms)
 */
export function useLongPress(
  callback: (e: React.MouseEvent | React.TouchEvent) => void,
  { threshold = 500 }: UseLongPressOptions = {}
) {
  const [pressing, setPressing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startPress = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      setPressing(true);
      // threshold 시간 이후 callback 실행
      timerRef.current = setTimeout(() => {
        callback(e);
      }, threshold);
    },
    [callback, threshold]
  );

  const endPress = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      setPressing(false);
      // 아직 타이머가 살아있다면 취소
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    },
    []
  );

  // 언마운트 시 타이머 클리어
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    onMouseDown: startPress,
    onMouseUp: endPress,
    onMouseLeave: endPress,     // 마우스가 벗어나면 길게누름 취소
    onTouchStart: startPress,
    onTouchEnd: endPress,
  };
}
