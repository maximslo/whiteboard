'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import io from 'socket.io-client';

const P5Sketch = dynamic(() => import('../components/P5Sketch'), { ssr: false });

export default function Home() {
  const [users, setUsers] = useState(1);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!);

    socket.on('users', (count: number) => {
      setUsers(count);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div
      style={{
        height: '100vh',
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          height: '50px',
          background: '#eee',
          textAlign: 'center',
          lineHeight: '50px',
          fontWeight: 'bold',
          fontSize: '18px',
          fontFamily: `'Inter', sans-serif`
        }}
      >
        {users/2}/4 beautiful men are currently online
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <P5Sketch />
      </div>
    </div>
  );
}
