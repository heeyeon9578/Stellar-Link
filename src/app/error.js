'use client';
export default function Error({error, reset}){
    return (
        <>
            <h4>페이지 에러 ${error}</h4>
            <button onClick={()=>reset()}></button>
        </>
    )
}