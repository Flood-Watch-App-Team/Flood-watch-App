export interface FloodReport {
  id: number;
  locationName: string;
  coordinates: [number, number];
  imageUrl: string;
  waterLevel: 'Low' | 'Medium' | 'High';
  status: 'Verified' | 'Receding';
}
