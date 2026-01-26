import apiClient from '../api-client';
const roomClient = {
    async getRooms() {
        const response = await apiClient.get('/rooms');
        return response.data;
    },
    async getRoomDetails(id) {
        const response = await apiClient.get(`/rooms/${id}`);
        return response.data;
    },
};
export default roomClient;
//# sourceMappingURL=room.client.js.map