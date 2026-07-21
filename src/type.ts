export interface FloodReport {
  id: number;
  locationName: string;
  coordinates: [number, number];
  imageUrl: string;
  images?: string[];         // <--- Add this property!
  waterLevel: 'Low' | 'Medium' | 'High';
  status: 'Verified' | 'Unverified';
  confirmations: number;
  photosCount: number;
  timeActive: string;
  createdAt: number;
}
export type TabType = 'maps' | 'feed' | 'report' | 'alerts' | 'profile';