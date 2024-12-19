'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function Detail() {
  const { data: session, status } = useSession();


  return (
    <div className=''>
     

     
    </div>
  );
}
