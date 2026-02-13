import React from 'react';
import BarChart from '../../charts/BarChart01';

// Import utilities
import { tailwindConfig } from '../../utils/Utils';

function GraphicHistory() {

  const chartData = {
    labels: [
      '12-01-2020', '01-01-2021', '02-01-2021',
      '03-01-2021', '04-01-2021', '05-01-2021',
    ],
    datasets: [
      // Light blue bars
      {
        label: 'Planeados',
        data: [
          800, 1600, 900, 1300, 1950, 1700,
        ],
        backgroundColor: '#A1DFBA',
        hoverBackgroundColor: '#A1DFBA',
        barPercentage: 0.66,
        categoryPercentage: 0.66,
      },
      // Blue bars
      {
        label: 'Completados',
        data: [
          4900, 2600, 5350, 4800, 5200, 4800,
        ],
        backgroundColor: '#009B4A',
        hoverBackgroundColor: '#009B4A',
        barPercentage: 0.66,
        categoryPercentage: 0.66,
      },
    ],
  };

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 bg-white rounded-sm mt-4">
      {/* Chart built with Chart.js 3 */}
      {/* Change the height attribute to adjust the chart height */}
      <BarChart data={chartData} width={955} height={248} />
    </div>
  );
}

export default GraphicHistory;
