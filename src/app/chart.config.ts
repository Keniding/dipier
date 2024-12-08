// src/app/chart.config.ts
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  BarController,
  PieController,
  DoughnutController,
  TimeScale,
  TimeSeriesScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  BarController,
  PieController,
  DoughnutController,
  TimeScale,
  TimeSeriesScale
);
