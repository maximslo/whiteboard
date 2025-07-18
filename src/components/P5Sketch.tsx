'use client';

import { useEffect, useRef, useState } from 'react';
import p5 from 'p5';
import io from 'socket.io-client';

type LineData = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  tool: 'pencil' | 'eraser';
};

export default function P5Sketch() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const p5InstanceRef = useRef<p5 | null>(null);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  const hasDrawnHistory = useRef(false);
  const historyQueueRef = useRef<LineData[]>([]);
  const isTouching = useRef(false);
  const isNewStroke = useRef(true);

  const [toolState, setToolState] = useState<'pencil' | 'eraser'>('pencil');
  const currentTool = useRef<'pencil' | 'eraser'>('pencil');

  // keep currentTool in sync with React state
  useEffect(() => {
    currentTool.current = toolState;
  }, [toolState]);

  useEffect(() => {
    const container = containerRef.current;
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!);
    socketRef.current = socket;

    const sketch = (p: p5) => {
      const isValidCoord = (x: number, y: number) => {
        return Number.isFinite(x) && Number.isFinite(y) && x >= 0 && y >= 0;
      };

      const applyTool = (tool: 'pencil' | 'eraser') => {
        if (tool === 'pencil') {
          p.stroke(0);
          p.strokeWeight(1);
        } else {
          p.stroke(255);
          p.strokeWeight(10);
        }
      };

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
      };

      p.draw = () => {
        // Replay history incrementally
        if (historyQueueRef.current.length) {
          const batchSize = 5;
          for (let i = 0; i < batchSize && historyQueueRef.current.length; i++) {
            const data = historyQueueRef.current.shift()!;
            applyTool(data.tool);
            p.line(data.x1, data.y1, data.x2, data.y2);
          }
        }

        // Live drawing
        if (p.mouseIsPressed || isTouching.current) {
          if (isNewStroke.current) {
            if (isValidCoord(p.mouseX, p.mouseY)) {
              p.pmouseX = p.mouseX;
              p.pmouseY = p.mouseY;
            }
            isNewStroke.current = false;
          }

          if (
            isValidCoord(p.pmouseX, p.pmouseY) &&
            isValidCoord(p.mouseX, p.mouseY)
          ) {
            const tool = currentTool.current;
            const lineData: LineData = {
              x1: p.pmouseX,
              y1: p.pmouseY,
              x2: p.mouseX,
              y2: p.mouseY,
              tool,
            };
            applyTool(tool);
            p.line(lineData.x1, lineData.y1, lineData.x2, lineData.y2);
            socket.emit('draw', lineData);
          }

        } else {
          isNewStroke.current = true;
        }
      };

      p.touchStarted = () => {
        isTouching.current = true;
        return false;
      };

      p.touchEnded = () => {
        isTouching.current = false;
        return false;
      };

      socket.on("history", (lines: LineData[]) => {
        if (!p5InstanceRef.current || hasDrawnHistory.current) return;

        hasDrawnHistory.current = true;

        const pInst = p5InstanceRef.current;
        pInst.background(255);

        historyQueueRef.current = [...lines];
      });

      socket.on("draw", (data: LineData) => {
        if (
          isValidCoord(data.x1, data.y1) &&
          isValidCoord(data.x2, data.y2)
        ) {
          applyTool(data.tool);
          p.line(data.x1, data.y1, data.x2, data.y2);
        }
      });
    };

    if (container) {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }

      container.innerHTML = '';

      p5InstanceRef.current = new p5(sketch, container);
    }

    return () => {
      socket.disconnect();
      p5InstanceRef.current?.remove();
      if (container) container.innerHTML = '';
    };
  }, []); // 👈 removed currentTool from deps

  return (
    <div
      style={{
        height: '100vh',
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Menu bar with tool buttons */}
      <div
        style={{
          height: '50px',
          background: '#eee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1rem',
          fontFamily: `'Inter', sans-serif`,
          fontWeight: 'bold',
          fontSize: '16px'
        }}
      >
        <div>✏️ Room 502</div>
        <div>
          <button
            onClick={() => setToolState('pencil')}
            style={{
              marginRight: '0.5rem',
              padding: '0.25rem 0.5rem',
              background: toolState === 'pencil' ? '#ccc' : '#fff',
              border: '1px solid #999',
              cursor: 'pointer',
            }}
          >
            Pencil
          </button>
          <button
            onClick={() => setToolState('eraser')}
            style={{
              padding: '0.25rem 0.5rem',
              background: toolState === 'eraser' ? '#ccc' : '#fff',
              border: '1px solid #999',
              cursor: 'pointer',
            }}
          >
            Eraser
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        style={{ flex: 1 }}
      />
    </div>
  );
}
