import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './api';
import { showAlert } from '../utils/alert';

let socket: Socket | null = null;

export const connectSocket = async (): Promise<Socket> => {
  const token = await AsyncStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }

  if (socket?.connected) {
    return socket;
  }

  socket = io(`${BASE_URL}/chat`, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    // Connected successfully
  });

  socket.on('disconnect', (reason) => {
    showAlert('Thông báo', 'Mất kết nối đến server. Đang thử kết nối lại...');
  });

  socket.on('connect_error', (error) => {
    showAlert('Lỗi kết nối', 'Không thể kết nối đến server: ' + error.message);
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default { connectSocket, getSocket, disconnectSocket };
