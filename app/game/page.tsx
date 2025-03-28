"use client";

import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const generateMaze = (size: number): string[][] => {
  const rows = size * 2 + 1;
  const cols = size * 2 + 1;
  const maze = Array.from({ length: rows }, () => Array(cols).fill("1"));

  const carvePath = (x: number, y: number) => {
    maze[x][y] = "0";
    const directions = [
      [0, -2],
      [0, 2],
      [-2, 0],
      [2, 0],
    ].sort(() => Math.random() - 0.5);

    for (const [dx, dy] of directions) {
      const nx = x + dx,
        ny = y + dy;
      if (
        nx > 0 &&
        nx < rows - 1 &&
        ny > 0 &&
        ny < cols - 1 &&
        maze[nx][ny] === "1"
      ) {
        maze[x + dx / 2][y + dy / 2] = "0";
        carvePath(nx, ny);
      }
    }
  };

  maze[1][1] = "E";
  carvePath(1, 1);
  maze[rows - 2][cols - 2] = "S";
  return maze;
};

const Game = () => {
  const [size, setSize] = useState(10);
  const [maze, setMaze] = useState<string[][]>(generateMaze(size));
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [trail, setTrail] = useState<boolean[][]>(
    Array.from({ length: maze.length }, () => Array(maze[0].length).fill(false))
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // Definição do canvasRef
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  useEffect(() => {
    setMaze(generateMaze(size));
    setPlayerPos({ x: 1, y: 1 });
    setTrail(
      Array.from({ length: size * 2 + 1 }, () =>
        Array(size * 2 + 1).fill(false)
      )
    );
  }, [size]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const { x, y } = playerPos;
    let newPos = { ...playerPos };

    if (event.key === "ArrowUp" && maze[x - 1]?.[y] !== "1")
      newPos = { x: x - 1, y };
    if (event.key === "ArrowDown" && maze[x + 1]?.[y] !== "1")
      newPos = { x: x + 1, y };
    if (event.key === "ArrowLeft" && maze[x]?.[y - 1] !== "1")
      newPos = { x, y: y - 1 };
    if (event.key === "ArrowRight" && maze[x]?.[y + 1] !== "1")
      newPos = { x, y: y + 1 };

    if (newPos.x === maze.length - 2 && newPos.y === maze[0].length - 2) {
      toast.success("Você ganhou a partida! 🎉");
    }

    if (newPos !== playerPos) {
      setPlayerPos(newPos);
      setTrail((prevTrail) => {
        const newTrail = prevTrail.map((row) => [...row]);
        newTrail[newPos.x][newPos.y] = true;
        return newTrail;
      });
      socket?.emit("move", newPos);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cellSize = Math.max(800 / maze[0].length, 5);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    maze.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (trail[rowIndex][colIndex]) {
          ctx.fillStyle = "rgba(128, 128, 128, 0.5)"; // Cinza semitransparente para o rastro
        } else {
          ctx.fillStyle =
            cell === "1"
              ? "black"
              : cell === "S"
              ? "green"
              : cell === "E"
              ? "red"
              : "white";
        }

        ctx.fillRect(
          colIndex * cellSize,
          rowIndex * cellSize,
          cellSize,
          cellSize
        );
      });
    });

    // Desenha o avatar
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(
      playerPos.y * cellSize + cellSize / 2,
      playerPos.x * cellSize + cellSize / 2,
      cellSize / 2.5,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }, [maze, playerPos, trail]);

  return (
    <div
      className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-4"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <h1 className="text-3xl font-bold mb-4">Labirinto</h1>
      <input
        type="range"
        min="5"
        max="100"
        value={size}
        onChange={(e) => setSize(Number(e.target.value))}
        className="w-64 mb-4"
      />
      <p>Complexidade: {size}</p>
      <canvas
        ref={canvasRef}
        width={maze[0].length * Math.max(800 / maze[0].length, 5)}
        height={maze.length * Math.max(800 / maze.length, 5)}
        className="border-2 border-white"
      />
      <ToastContainer />
    </div>
  );
};

export default Game;
