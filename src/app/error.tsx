'use client';

interface ErrorProps {
    error: Error;
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    return (
        <div className="h-screen flex">
                    <h4>페이지 에러: {error.message}</h4>
                    <button onClick={reset}>다시 시도</button>
        </div>
        
    );
}