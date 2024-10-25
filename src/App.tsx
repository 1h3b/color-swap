import React, { useState } from "react";
import "./App.css";
import { motion } from "framer-motion";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

// Type definition for the square object
interface Square {
  id: number;
  color: string;
}

enum Level {
  Easy = 0,
  Medium = 1,
  Hard = 2,
  Extreme = 3,
}

let level = Level.Easy;

const swapsPerDifficulty = [2, 6, 500, 500];
const swapsRemainingPerLevel = [10, 30, 40, 60];

function App() {
  // Define the solution grid colors
  const colors: string[] = [
    "#FF0000", // Red
    "#008000", // Green
    "#0000FF", // Blue
    "#FFA500", // Orange
    "#FFFFFF", // White
    "#FFFF00",
  ];
  const solutionColors: string[] = [
    "#FF0000", // Red
    "#008000", // Green
    "#0000FF", // Blue
    "#FFA500", // Orange
    "#FFFFFF", // White
    "#FFFF00", // Yellow
    "#FFA500", // Orange
    "#FF0000", // Red
    "#FFFF00", // Yellow
    "#FFFFFF", // White
    "#008000", // Green
    "#0000FF", // Blue
    "#FFFF00", // Yellow
    "#FFA500", // Orange
    "#FFFFFF", // White
    "#FF0000", // Red
    "#0000FF", // Blue
    "#008000", // Green
    "#FFFFFF", // White
    "#FFA500", // Orange
    "#008000", // Green
    "#FF0000", // Red
    "#FFFF00", // Yellow
    "#0000FF", // Blue
    "#FFFF00", // Yellow
  ];

  const swapRandomElements = (array: string[], swapCount: number) => {
    const shuffledArray = [...array]; // Create a copy to avoid mutating the original

    for (let i = 0; i < swapCount; i++) {
      const index1 = Math.floor(Math.random() * shuffledArray.length);
      const index2 = Math.floor(Math.random() * shuffledArray.length);

      // Swap elements at index1 and index2
      [shuffledArray[index1], shuffledArray[index2]] = [
        shuffledArray[index2],
        shuffledArray[index1],
      ];
    }

    return shuffledArray;
  };

  function derangedShuffle<T>(arr: T[]): T[] {
    const result = [...arr]; // Make a copy of the array
    let n = arr.length;

    do {
      // Fisher-Yates Shuffle
      for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
    } while (!isDerangement(arr, result));

    return result;
  }

  function isDerangement<T>(original: T[], shuffled: T[]): boolean {
    return original.every((value, index) => value !== shuffled[index]);
  }

  // Function to shuffle the colors for random permutation
  const shuffleArray = (array: string[]) => {
    return array
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  };

  let shuffledSolution: Square[];

  if (level === Level.Extreme) {
    shuffledSolution = derangedShuffle(solutionColors).map((color, index) => ({
      id: index,
      color,
    }));
  } else {
    shuffledSolution = swapRandomElements(
      solutionColors,
      swapsPerDifficulty[level]
    ).map((color, index) => ({
      id: index,
      color,
    }));
  }

  let initialSquares: Square[] = Array(6)
    .fill("#ffffff")
    .map((color, index) => ({ id: 100 + index, color } as Square))
    .concat(shuffledSolution);
  const positions = [6, 12, 18, 24, 30];
  positions.forEach((position) => {
    initialSquares.splice(position, 0, {
      id: 200 + position,
      color: "#ffffff",
    } as Square); // Add newElement at the specified index
  });

  const isColIndex = (index: number) => {
    return index < 6;
  };

  const isRowIndex = (index: number) => {
    return index % 6 === 0;
  };

  const [squares, setSquares] = useState<Square[]>(initialSquares);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<Level>(Level.Easy);
  const [swapsRemaining, setSwapsremaining] = useState<number>(
    swapsRemainingPerLevel[Level.Easy]
  );
  const [isGameOver, setIsGameOver] = useState(false);

  const handleDifficultyChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedDifficulty = Number(event.target.value);
    setDifficulty(selectedDifficulty);
    initializeGrid(selectedDifficulty);
    setSwapsremaining(swapsRemainingPerLevel[selectedDifficulty]);
  };

  const initializeGrid = (selectedDifficulty: Level) => {
    let shuffledSolution: Square[];

    if (selectedDifficulty === Level.Extreme) {
      shuffledSolution = derangedShuffle(solutionColors).map(
        (color, index) => ({
          id: index,
          color,
        })
      );
    } else {
      shuffledSolution = swapRandomElements(
        solutionColors,
        swapsPerDifficulty[selectedDifficulty]
      ).map((color, index) => ({
        id: index,
        color,
      }));
    }

    let initialSquares: Square[] = Array(6)
      .fill("#ffffff")
      .map((color, index) => ({ id: 100 + index, color } as Square))
      .concat(shuffledSolution);

    const positions = [6, 12, 18, 24, 30];
    positions.forEach((position) => {
      initialSquares.splice(position, 0, {
        id: 200 + position,
        color: "#ffffff",
      } as Square);
    });

    setSquares(initialSquares);
  };

  const calculateRowScore = (rowIndex: number) => {
    rowIndex = (rowIndex % 100) - 6; // Map to 0, 6, 12, etc.
    rowIndex = Math.floor((rowIndex / 6) * 5); // Adjust to the 5x5 grid
    let correctColors = 0;

    // No need to slice, but skip the first 6 (like you're doing)
    const squaresTail = squares.slice(6).filter((sq) => sq.color != "#ffffff");

    for (let i = 0; i < 5; i++) {
      if (squaresTail[rowIndex + i]?.color === solutionColors[rowIndex + i]) {
        correctColors++;
      }
    }

    return correctColors;
  };

  const calculateColScore = (colIndex: number) => {
    colIndex = colIndex % 100; // Keep the original colIndex logic
    let correctColors = 0;

    // Filter out white squares like before
    const squaresTail = squares.slice(6).filter((sq) => sq.color != "#ffffff");

    // Column logic: iterate over each row at the specific column index
    for (let i = 0; i < 5; i++) {
      const index = colIndex - 1 + i * 5; // Correct formula for vertical traversal
      if (squaresTail[index]?.color === solutionColors[index]) {
        correctColors++;
      }
    }

    return correctColors;
  };

  // Handle drag start
  const handleDragStart = (index: number) => {
    if (!isColIndex(index) && !isRowIndex(index)) {
      setDraggingIndex(index);
    }
  };

  // Handle drag move
  const handleDragMove = (event: any) => {
    if (draggingIndex !== null) {
      const x = event.point.x;
      const y = event.point.y;
      const gridElement = document.querySelector(
        ".grid-container"
      ) as HTMLElement;
      const boundingRect = gridElement.getBoundingClientRect();
      const relativeX = x - boundingRect.left;
      const relativeY = y - boundingRect.top;

      const column = Math.floor(relativeX / 60); // Assume square size + gap
      const row = Math.floor(relativeY / 60);
      if (row > 5 || column > 5) {
        setHoverIndex(null);
        return;
      }
      const hoverIndex = row * 6 + column; // Update to 6x6 grid

      if (hoverIndex >= 0 && hoverIndex < squares.length) {
        setHoverIndex(hoverIndex);
      }
    }
  };

  // Handle drag end and swap squares
  const handleDragEnd = () => {
    if (
      hoverIndex !== null &&
      (isColIndex(hoverIndex) || isRowIndex(hoverIndex))
    ) {
      setDraggingIndex(null);
      setHoverIndex(null);
      return;
    }
    if (
      draggingIndex !== null &&
      hoverIndex !== null &&
      draggingIndex !== hoverIndex
    ) {
      const updatedSquares = [...squares];
      // Swap the colors
      [updatedSquares[draggingIndex].color, updatedSquares[hoverIndex].color] =
        [updatedSquares[hoverIndex].color, updatedSquares[draggingIndex].color];

      setSquares(updatedSquares);
      setSwapsremaining(swapsRemaining - 1);
      if (swapsRemaining - 1 === 0 && !areAllScoresPerfect()) {
        setIsGameOver(true);
      }
    }
    // Reset drag state
    setDraggingIndex(null);
    setHoverIndex(null);
  };

  const areAllScoresPerfect = () => {
    const rowScores = Array.from({ length: 5 }, (_, i) => calculateRowScore(i));
    const colScores = Array.from({ length: 5 }, (_, i) =>
      calculateColScore(i + 1)
    );

    const allScores = [...rowScores, ...colScores];

    return allScores.every((score) => score === 5);
  };

  const newGame = () => {
    setIsGameOver(false); // Close the modal
    initializeGrid(difficulty); // Add any additional logic for starting a new game here
    setSwapsremaining(swapsRemainingPerLevel[difficulty]);
  };

  return (
    <div className="App">
      <header className="App-header">
        {/* Difficulty Selector */}
        <div className="difficulty-selector">
          <label htmlFor="difficulty">Select Difficulty: </label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={handleDifficultyChange}
            className="custom-select"
          >
            <option value={Level.Easy}>Easy</option>
            <option value={Level.Medium}>Medium</option>
            <option value={Level.Hard}>Hard</option>
            <option value={Level.Extreme}>Extreme</option>
          </select>
        </div>
        {/* Grid Container */}
        <motion.div className="grid-container">
          {squares.map((square, index) => {
            if (!isColIndex(index) && !isRowIndex(index)) {
              return (
                <motion.div
                  className="square"
                  key={square.id}
                  style={{
                    backgroundColor: square.color,
                    zIndex: draggingIndex === index ? 1000 : "auto",
                  }}
                  drag
                  dragElastic={1}
                  dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
                  dragTransition={{ bounceStiffness: 600, bounceDamping: 50 }} // Makes the return faster
                  whileTap={{ scale: 1.2 }}
                  animate={{ scale: index === hoverIndex ? 1.2 : 1 }}
                  onDragStart={() => handleDragStart(index)}
                  onDrag={(event: any, info: any) => handleDragMove(info)}
                  onDragEnd={handleDragEnd}
                />
              );
            } else {
              return (
                <motion.div
                  className="square"
                  key={square.id}
                  style={{
                    pointerEvents: "none",
                    userSelect: "none",
                    display: "flex", // Flexbox for centering
                    justifyContent: "center", // Horizontally center the content
                    alignItems: "center", // Vertically center the content
                    width: "100%", // Ensure the div fills its parent width
                    fontSize: "1.5rem",
                  }}
                >
                  {square.id > 200
                    ? calculateRowScore(square.id)
                    : square.id > 100 && square.id <= 200
                    ? calculateColScore(square.id)
                    : ""}
                </motion.div>
              );
            }
          })}
        </motion.div>
        <div className="pl-12 pt-5 text-2xl font-bold">
          {swapsRemaining} swaps remaining
        </div>

        {/* Show Bravo message if all scores are 5 */}
        {areAllScoresPerfect() && (
          <div className="pl-12 pt-5 text-2xl font-bold">
            <h1>Bravo!</h1>
          </div>
        )}
      </header>
      {isGameOver && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-4/5 sm:w-1/4  p-8 rounded-lg shadow-lg relative">
            <h2 className="text-3xl font-bold mb-4">Game Over</h2>
            <p className="mb-4 text-xl">No swaps remaining!</p>
            <p className="mb-4 text-xl">Better luck next time.</p>
            <div className="text-2xl">😢</div>
            {/* New Game Button */}
            <button
              className="mt-6 w-1/2 bg-black text-white px-4 py-2 rounded"
              onClick={newGame}
            >
              New Game
            </button>
          </div>
        </div>
      )}

      <SpeedInsights />
      <Analytics />
    </div>
  );
}

export default App;
