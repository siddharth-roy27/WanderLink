import { io, Socket } from 'socket.io-client';
import { useEffect, useRef } from 'react';

class ChatService {
  private socket: Socket | null = null;

  connect(userId: string) {
    if (this.socket?.connected) return;

    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000', {
      query: { userId },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to chat server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(roomId: string) {
    this.socket?.emit('join_room', roomId);
  }

  leaveRoom(roomId: string) {
    this.socket?.emit('leave_room', roomId);
  }

  sendMessage(roomId: string, message: any) {
    this.socket?.emit('send_message', { roomId, ...message });
  }

  onMessageReceived(callback: (data: any) => void) {
    this.socket?.on('receive_message', callback);
  }

  onUserJoined(callback: (data: any) => void) {
    this.socket?.on('user_joined', callback);
  }

  onUserLeft(callback: (data: any) => void) {
    this.socket?.on('user_left', callback);
  }

  sendLocation(roomId: string, location: { lat: number; lng: number }) {
    this.socket?.emit('send_location', { roomId, location });
  }

  onLocationReceived(callback: (data: any) => void) {
    this.socket?.on('receive_location', callback);
  }
}

export const chatService = new ChatService();

// React hook for using chat service
export function useChat(userId: string) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    chatService.connect(userId);
    socketRef.current = chatService.socket;

    return () => {
      chatService.disconnect();
    };
  }, [userId]);

  return chatService;
}
