import { Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DonutChart({
    labels = [],
    datasets = [],
    showLegend = true,
    cutout = "65%",
    options = {},
}) {
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout,
        plugins: {
            legend: {
                display: showLegend,
                position: "right",
                labels: { color: "#94a3b8", font: { family: "Inter" } },
            },
            tooltip: {
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                titleColor: "#f1f5f9",
                bodyColor: "#94a3b8",
            },
        },
        ...options,
    };

    return <Doughnut data={{ labels, datasets }} options={defaultOptions} />;
}
