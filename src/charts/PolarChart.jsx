import React, { useRef, useEffect } from 'react';
import { PolarAreaController, RadialLinearScale, Tooltip, Legend } from 'chart.js';
import Chart from "chart.js/auto";
import 'chartjs-adapter-moment';

Chart.register(PolarAreaController, RadialLinearScale, Tooltip, Legend);

const PolarChart = ({ data, width, height }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const chart = new Chart(ctx, {
      type: 'polarArea',
      data: data,
      options: {
        layout: {
          padding: 24,
        },
        plugins: {
          legend: {
            display: false,
          },
        },
        interaction: {
          intersect: false,
          mode: 'nearest',
        },
        animation: {
          duration: 500,
        },
        maintainAspectRatio: false,
        resizeDelay: 200,
      },
    });

    return () => {
      // Cleanup function - destroy the chart when the component is unmounted
      chart.destroy();
    };
  }, [data]);

  return (
    <div className="grow flex flex-col justify-center">
      <div>
        <canvas ref={canvasRef} width={width} height={height}></canvas>
      </div>
    </div>
  );
};

export default PolarChart;
