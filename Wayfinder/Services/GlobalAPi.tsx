import axios from 'axios';

const API_KEY = ''; // Replace with your actual API key (google Places)

interface BusStand {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  vicinity?: string;
}

export const fetchNearbyBusStands = async (
  latitude: number,
  longitude: number,
  radius: number = 1000
): Promise<BusStand[]> => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
      {
        params: {
          location: `${latitude},${longitude}`,
          radius: radius,
          type: 'bus_stand',
          key: API_KEY,
        },
      }
    );

    return response.data.results.map((place: any) => ({
      id: place.place_id,
      name: place.name,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      vicinity: place.vicinity,
    }));
  } catch (error) {
    console.error('Error fetching bus stands:', error);
    return []; // Return empty array on error
  }
};