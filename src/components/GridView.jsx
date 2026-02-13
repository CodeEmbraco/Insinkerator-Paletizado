import { useState, useEffect } from "react";
import Tooltip from "react-simple-tooltip"

const GridView = ({ rows, columns, elements, iniPainted, counterProduct, data }) => {
  console.log("....... GRID VIEW .......");
  console.log("data", data);
  const createInitialGrid = () =>
    Array(rows)
      .fill()
      .map(() => Array(columns).fill(false));
  const [grid, setGrid] = useState(createInitialGrid);

  useEffect(() => {
    const newGrid = createInitialGrid().map((rowArr, rowIndex) =>
      rowArr.map((_, colIndex) =>
        elements.some((e) => e.row === rowIndex && e.col === colIndex) || ( rowIndex*columns + colIndex  < iniPainted )
      )
    );
    setGrid(newGrid);
  }, [elements, rows, columns]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 50px)`,
        gap: "5px",
      }}
    >
      
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Tooltip content={`${iniPainted}`}>
          <div
            key={`${rowIndex}-${colIndex}`}
            style={{
              width: "50px",
              height: "50px",
              backgroundColor: cell ? "#009B4A" : "white",
              border: "1px solid #C7CDD7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: cell ? "white" : "black",
              position: "relative",
            }}
          >
          
            {cell ? `${rowIndex * columns + colIndex + 1}` : ""}

          </div>
          </Tooltip>

        ))
      )}
    </div>
  );
};

export default GridView;
