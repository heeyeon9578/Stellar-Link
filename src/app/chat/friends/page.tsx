import Image from 'next/image';
export default function friends(){
    return(
        <div className="w-full h-full flex items-center justify-center">
            <Image
            src="/SVG/bigLogo.svg"
            alt="select"
            width={339}
            height={199}
            priority
            className=""
          />
        </div>
    )
}