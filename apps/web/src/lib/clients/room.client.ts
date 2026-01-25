import apiClient from '../api-client';
import { RoomResponse } from '@travel-web/contracts';

const roomClient = {
  async getRooms(): Promise<RoomResponse[]> {
    const response = await apiClient.get('/rooms');
    return response.data;
  },

  async getRoomDetails(id: string): Promise<RoomResponse> {
    const response = await apiClient.get(`/rooms/${id}`);
    return response.data;
  },
};

export default roomClient;
