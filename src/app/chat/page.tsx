'use client';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function Detail() {
  const { data: session, status } = useSession();


  return (
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
  );
}
