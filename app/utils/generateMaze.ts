export function generateMaze(width: number, height: number): string[][] {
  const maze: string[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => "1")
  );

  // Algoritmo básico de criação de labirinto
  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      maze[y][x] = "0"; // Caminho aberto

      // Criando passagens
      const directions = [
        [0, -1],
        [0, 1],
        [-1, 0],
        [1, 0],
      ];
      const [dx, dy] =
        directions[Math.floor(Math.random() * directions.length)];
      const nx = x + dx,
        ny = y + dy;
      if (nx > 0 && ny > 0 && nx < width - 1 && ny < height - 1) {
        maze[ny][nx] = "0"; // Abre passagem
      }
    }
  }

  return maze;
}
