// models/chart.models.ts
export interface ChartDataset {
  data: number[];
  label: string;
  backgroundColor: string | string[];
  borderColor: string | string[];
  borderWidth: number;
  fill: boolean;
  tension?: number;
}

export interface ChartConfigurationData {
  labels: string[];
  datasets: ChartDataset[];
}
