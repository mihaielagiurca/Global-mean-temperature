import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);
function App() {
  const [csvData, setCsvData] = useState("");
 
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  //create the chartIt function
  const chartIT = (labels, temps) => {
    // Destroy existing chart before creating a new one
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Initialize the Chart after data is fetched
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels, 
          datasets: [{
            label: 'Global Average Temperature 1880-2024',
            data: temps, 
            borderWidth: 1,
            backgroundColor: 'rgba(78, 44, 212, 0.2)',
            borderColor: 'rgb(104, 75, 192)',
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
                ticks: {
                    // Include celcius sign in the ticks
                    callback: function(value, index, ticks) {
                        return value + "°";
                    }
                }
            }
          }
        }
      });
    }
  };

  useEffect(() => {
    async function getData() {
      try {
        const response = await fetch("https://mihaielagiurca.github.io/Global-mean-temperature/public/ZonAnn.Ts+dSST.csv");
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        const data = await response.text();
        setCsvData(data);

        const table = data.split("\n").slice(1); // Skip header row
        const labels = [];
        const temps = [];

        table.forEach(row => {
            const columns =  row.split(",")
            labels.push(columns[0]);
            temps.push(parseFloat(columns[1])+14);
        });

        // Call the chartIT function to create the chart after the data is fetched
        chartIT(labels, temps);
      } catch (error) {
        console.error("Error fetching CSV:", error);
      }
    }

    getData();

    // Cleanup the chart on component unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []); 

  return (
    <>
      <pre>{csvData}</pre>
      <div className="chart">
        <canvas  ref={chartRef}></canvas>
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
