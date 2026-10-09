import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function AreaChart({
    labels = [],
    datasets = [],
    showLegend = true,
    options = {},
}) {
    const filledDatasets = datasets.map((ds) => ({
        ...ds,
        fill: "origin",
        tension: 0.4,
    }));

    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: showLegend,
                position: "top",
                labels: { color: "#94a3b8", font: { family: "Inter" } },
            },
            tooltip: {
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                titleColor: "#f1f5f9",
                bodyColor: "#94a3b8",
            },
        },
        scales: {
            x: {
                grid: { color: "rgba(255, 255, 255, 0.05)" },
                ticks: { color: "#94a3b8" },
            },
            y: {
                grid: { color: "rgba(255, 255, 255, 0.05)" },
                ticks: { color: "#94a3b8" },
            },
        },
        ...options,
    };

    return <Line data={{ labels, datasets: filledDatasets }} options={defaultOptions} />;
}
