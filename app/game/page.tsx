"use client";

import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const GameCanvas = () => {
  const [maze, setMaze] = useState<string[][]>([]);
  const [players, setPlayers] = useState<{
    [key: string]: { x: number; y: number };
  }>({});
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [socket, setSocket] = useState<Socket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [size, setSize] = useState(5); // complexidade
  const [toast, setToast] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [path, setPath] = useState<{ x: number; y: number }[]>([]); // Para armazenar o rastro
  const [exitPos, setExitPos] = useState<{ x: number; y: number } | null>(null); // Para armazenar a saída

  useEffect(() => {
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);

    newSocket.on("startGame", (mazeFromServer) => {
      setMaze(mazeFromServer);
      findValidStartingPosition(mazeFromServer);
      findExitPosition(mazeFromServer); // Encontrar a saída
      showToast("Jogo iniciado com sucesso!", "success");
    });

    newSocket.on("updatePlayers", (playersFromServer) => {
      setPlayers(playersFromServer);
    });

    newSocket.on("gameOver", (winnerId) => {
      setGameOver(true);
      showToast(`Jogador ${winnerId} venceu!`, "success");
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.emit("playerJoined", playerPos);
    }
  }, [socket]);

  const findValidStartingPosition = (maze: string[][]) => {
    for (let x = 0; x < maze.length; x++) {
      for (let y = 0; y < maze[0].length; y++) {
        if (maze[x][y] === "0") {
          setPlayerPos({ x, y });
          return;
        }
      }
    }
  };

  // Encontrar a posição de saída
  const findExitPosition = (maze: string[][]) => {
    for (let x = 0; x < maze.length; x++) {
      for (let y = 0; y < maze[0].length; y++) {
        if (maze[x][y] === "E") {
          setExitPos({ x, y });
          return;
        }
      }
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Função que verifica se a movimentação é válida
  const isValidMove = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= maze.length || y >= maze[0].length) {
      return false; // Checa se a posição está fora do labirinto
    }
    if (maze[x][y] === "1") {
      return false; // Checa se a posição é um obstáculo (parede)
    }
    return true; // A posição é válida
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      let newX = playerPos.x;
      let newY = playerPos.y;

      switch (e.key) {
        case "ArrowUp":
          if (isValidMove(newX - 1, newY)) newX -= 1;
          break;
        case "ArrowDown":
          if (isValidMove(newX + 1, newY)) newX += 1;
          break;
        case "ArrowLeft":
          if (isValidMove(newX, newY - 1)) newY -= 1;
          break;
        case "ArrowRight":
          if (isValidMove(newX, newY + 1)) newY += 1;
          break;
      }

      // Verifica se o jogador chegou na saída
      if (newX === exitPos?.x && newY === exitPos?.y) {
        showToast("Você ganhou a partida! 🎉", "success");
        setGameOver(true); // Marcando o jogo como terminado
      }

      if (newX !== playerPos.x || newY !== playerPos.y) {
        setPlayerPos({ x: newX, y: newY });
        setPath((prevPath) => [...prevPath, { x: newX, y: newY }]); // Atualizando a trilha
        if (socket) {
          socket.emit("move", { x: newX, y: newY });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [playerPos, gameOver, exitPos, socket]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (!maze.length || !maze[0].length) return;

    // Ajustar o tamanho do canvas baseado na complexidade
    const canvasWidth = Math.min(800, maze[0].length * 40); // Tamanho máximo do canvas
    const canvasHeight = Math.min(800, maze.length * 40); // Tamanho máximo do canvas
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const cellSize = Math.min(
      canvasWidth / maze[0].length,
      canvasHeight / maze.length
    );

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhando o labirinto
    maze.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        ctx.fillStyle = cell === "1" ? "black" : "white";
        ctx.fillRect(
          colIndex * cellSize,
          rowIndex * cellSize,
          cellSize,
          cellSize
        );
      });
    });

    // Desenhando a saída
    if (exitPos) {
      ctx.fillStyle = "red"; // Usando vermelho para a saída
      ctx.beginPath();
      ctx.arc(
        exitPos.y * cellSize + cellSize / 2,
        exitPos.x * cellSize + cellSize / 2,
        cellSize / 2.5,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }

    // Desenhando o rastro do avatar
    path.forEach(({ x, y }) => {
      ctx.fillStyle = "blue"; // Cor do rastro
      ctx.beginPath();
      ctx.arc(
        y * cellSize + cellSize / 2,
        x * cellSize + cellSize / 2,
        cellSize / 2.5,
        0,
        2 * Math.PI
      );
      ctx.fill();
    });

    // Desenhando os jogadores
    Object.entries(players).forEach(([id, { x, y }]) => {
      ctx.fillStyle = id === socket?.id ? "blue" : "red";
      ctx.beginPath();
      ctx.arc(
        y * cellSize + cellSize / 2,
        x * cellSize + cellSize / 2,
        cellSize / 2.5,
        0,
        2 * Math.PI
      );
      ctx.fill();
    });
  }, [maze, players, path, exitPos]); // Dependência de exitPos

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-semibold mb-4">Bem-vindo ao Labirinto!</h1>
      {toast && (
        <div
          className={`toast p-2 mb-4 rounded ${
            toast.includes("erro") ? "bg-red-500" : "bg-blue-500"
          } text-white`}
        >
          {toast}
        </div>
      )}
      <canvas ref={canvasRef} className="border-2 border-black mb-4" />
      <div className="flex items-center gap-2 mb-4">
        <label className="text-lg">Complexidade:</label>
        <input
          type="number"
          value={size}
          min="3"
          max="20"
          onChange={(e) => setSize(parseInt(e.target.value))}
          className="border px-2 py-1"
        />
        <button
          onClick={() => socket?.emit("startGameWithComplexity", size)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Iniciar Jogo
        </button>
      </div>
      {gameOver && <div className="text-lg font-semibold">Jogo terminado!</div>}
    </div>
  );
};

export default GameCanvas;
