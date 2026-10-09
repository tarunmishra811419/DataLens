import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BarChart({
    labels = [],
    datasets = [],
    horizontal = false,
    showLegend = true,
    options = {},
}) {
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: horizontal ? "y" : "x",
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

    return <Bar data={{ labels, datasets }} options={defaultOptions} />;
}
