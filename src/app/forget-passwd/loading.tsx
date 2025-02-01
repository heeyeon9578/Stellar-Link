'use client';
import Skeleton from "@/app/components/Skeleton";
export default function Loading(){
    return (
        <div className="h-screen flex items-center justify-center">

            <Skeleton width="80%" height="50px" borderRadius="8px" 
            className="
            mb-2 opacity-30 md:w-[620px] w-[90%]  md:rounded-[40px] rounded-[20px] 
            " />

        </div>
    )
}