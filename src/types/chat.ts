import type { UserRole } from './roles';

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string;
  text: string;
  createdAt: string;
  read: boolean;
};

export type Conversation = {
  id: string;
  participants: string[];
  athleteId: string;
  athleteName: string;
  athleteSport: string;
  coachId: string;
  coachName: string;
  lastMessageText: string;
  lastMessageTime: string;
  lastSenderId: string;
  unreadCountForAthlete: number;
  unreadCountForCoach: number;
  updatedAt: string;
};
