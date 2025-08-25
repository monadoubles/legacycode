// 'use client';

// import { useEffect, useRef, useState } from 'react';

// export interface WebSocketMessage {
//   type: string;
//   data: any;
//   timestamp: number;
// }

// export function useWebSocket(url: string) {
//   const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
//   const [readyState, setReadyState] = useState<number>(3); // CLOSED initially
  
//   const sendMessage = (message: any) => {
//     // Mock implementation for development
//     console.log('Sending message:', message);
//   };

//   return {
//     lastMessage,
//     readyState,
//     sendMessage,
//   };
// }
