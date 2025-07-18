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
      <div style={{
        textAlign: 'center',
        fontSize: '14px',
        fontFamily: 'sans-serif',
        padding: '0.25rem',
        background: '#f7f7f7',
        borderBottom: '1px solid #ddd'
      }}>
        👥 {users} beautiful {users !== 1 ? 'men' : 'man'} online
      </div>

      <div style={{ flex: 1 }}>
        <P5Sketch />
      </div>
    </div>
  );
}
