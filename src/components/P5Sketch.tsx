'use client';

import { useEffect, useRef } from 'react';
import p5 from 'p5';
import io from 'socket.io-client';

type LineData = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export default function P5Sketch() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const p5InstanceRef = useRef<p5 | null>(null);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  const hasDrawnHistory = useRef(false);
  const historyQueueRef = useRef<LineData[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!);
    socketRef.current = socket;

    const sketch = (p: p5) => {
      p.setup = () => {
        const menuHeight = 50;
        const border = 2;

        const canvasWidth = window.innerWidth - border * 2;
        const canvasHeight = window.innerHeight - menuHeight - border * 2;

        const cnv = p.createCanvas(canvasWidth, canvasHeight);

        cnv.parent(container!);
        cnv.style('border', '2px solid blue');
        cnv.style('box-sizing', 'border-box');

        p.background(255);
        p.stroke(0);
      };

      p.draw = () => {
        // Replay history incrementally
        if (historyQueueRef.current.length) {
          const batchSize = 5; // adjust for speed/smoothness
          for (let i = 0; i < batchSize && historyQueueRef.current.length; i++) {
            const data = historyQueueRef.current.shift()!;
            p.line(data.x1, data.y1, data.x2, data.y2);
          }
        }

        // Handle live drawing
        if (p.mouseIsPressed) {
          const lineData: LineData = {
            x1: p.pmouseX,
            y1: p.pmouseY,
            x2: p.mouseX,
            y2: p.mouseY,
          };
          p.line(lineData.x1, lineData.y1, lineData.x2, lineData.y2);
          socket.emit('draw', lineData);
        }
      };
    };

    if (container) {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }

      container.innerHTML = '';

      p5InstanceRef.current = new p5(sketch, container);
    }

    socket.on("history", (lines: LineData[]) => {
      if (!p5InstanceRef.current || hasDrawnHistory.current) return;

      hasDrawnHistory.current = true;

      const pInst = p5InstanceRef.current;
      pInst.background(255);

      historyQueueRef.current = [...lines];
    });

    socket.on("draw", (data: LineData) => {
      p5InstanceRef.current?.line(
        data.x1, data.y1, data.x2, data.y2
      );
    });

    return () => {
      socket.disconnect();
      p5InstanceRef.current?.remove();
      if (container) container.innerHTML = '';
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ flex: 1 }}
    />
  );
}
