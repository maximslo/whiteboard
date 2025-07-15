'use client';

import dynamic from 'next/dynamic';

const P5Sketch = dynamic(() => import('../components/P5Sketch'), { ssr: false });

export default function Home() {
  return (
    <main style={{ height: '100vh', margin: 0 }}>
      <P5Sketch />
    </main>
  );
}
