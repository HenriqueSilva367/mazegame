import React, { useEffect, useRef } from "react";

interface MazeImageProps {
  maze: string[][];
}

const MazeImage = ({ maze }: MazeImageProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const cellSize = 30;
        maze.forEach((row, rowIndex) => {
          row.forEach((cell, colIndex) => {
            const x = colIndex * cellSize;
            const y = rowIndex * cellSize;

            if (cell === "1") {
              ctx.fillStyle = "black"; // Paredes
            } else if (cell === "S") {
              ctx.fillStyle = "green"; // Saída
            } else if (cell === "E") {
              ctx.fillStyle = "red"; // Entrada
            } else {
              ctx.fillStyle = "white"; // Caminho
            }

            ctx.fillRect(x, y, cellSize, cellSize);
          });
        });
      }
    }
  }, [maze]);

  return (
    <canvas
      ref={canvasRef}
      width={maze[0].length * 30}
      height={maze.length * 30}
      className="border-4 border-white rounded-lg shadow-xl"
    ></canvas>
  );
};

export default MazeImage;
