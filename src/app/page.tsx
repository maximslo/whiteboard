'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import io from 'socket.io-client';

// Lazy-load P5Sketch because it uses window & p5
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
      {/* You already have a menu bar in P5Sketch */}
      {/* So here you can optionally show users below or leave it out */}
      <div style={{
        textAlign: 'center',
        fontSize: '14px',
        fontFamily: 'sans-serif',
        padding: '0.25rem',
        background: '#f7f7f7',
        borderBottom: '1px solid #ddd'
      }}>
        👥 {users} user{users !== 1 ? 's' : ''} online
      </div>

      <div style={{ flex: 1 }}>
        <P5Sketch />
      </div>
    </div>
  );
}
