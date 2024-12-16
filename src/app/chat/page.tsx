'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function Detail() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <p>Loading...</p>;
  if (!session) return <p>You are not logged in</p>;
  

  return (
    <div className=''>
     

     
    </div>
  );
}
