export interface FloodReport {
  id: number;
  locationName: string;
  coordinates: [number, number];
  imageUrl: string;
  waterLevel: 'Low' | 'Medium' | 'High';
  status: 'Active' | 'Receding';
}
// Explicitly define it as a strict 2-element tuple
const lagosBounds: [ [number, number], [number, number] ] = [
  [2.6924, 6.2201], // Southwest corner
  [4.2505, 6.7020]  // Northeast corner
];