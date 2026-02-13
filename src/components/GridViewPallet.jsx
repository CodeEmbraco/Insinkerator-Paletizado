import { useState, useEffect } from "react";

const GridView = ({ rows, columns, elements, iniPainted }) => {
  const createInitialGrid = () =>
    Array(rows)
      .fill()
      .map(() => Array(columns).fill(false));
  const [grid, setGrid] = useState(createInitialGrid);

  useEffect(() => {
    const newGrid = createInitialGrid().map((rowArr, rowIndex) =>
      rowArr.map((_, colIndex) =>
        elements.some((e) => e.row === rowIndex && e.col === colIndex) || ( ( 7 - rowIndex) *columns + colIndex  < iniPainted )
      )
    );
    setGrid(newGrid);
  }, [elements, rows, columns]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 50px)`,
        gap: "2px",
      }}
    >
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            style={{
              width: "60px",
              height: "25px",
              backgroundColor: cell ? "#8B4513" : "white",
              border: "1px solid #C7CDD7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: cell ? "white" : "black",
            }}
          >
            {cell ? `${ ( 7 - rowIndex ) * columns + colIndex + 1}` : ""}
          </div>
        ))
      )}
    </div>
  );
};

export default GridView;
