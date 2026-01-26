import { RoomResponse } from '@travel-web/contracts';
declare const roomClient: {
    getRooms(): Promise<RoomResponse[]>;
    getRoomDetails(id: string): Promise<RoomResponse>;
};
export default roomClient;
//# sourceMappingURL=room.client.d.ts.map