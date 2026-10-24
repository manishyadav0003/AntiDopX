import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { ChatMessage, Conversation } from '../types/chat';
import type { UserRole } from '../types/roles';
import { getErrorMessage, type ServiceResponse } from '../types/serviceResponse';

export const getOrCreateConversation = async (
  athleteId: string,
  coachId: string,
  athleteName: string,
  coachName: string,
  athleteSport = 'General'
): Promise<ServiceResponse<Conversation>> => {
  try {
    const convId = `${athleteId}_${coachId}`;
    const convRef = doc(db, 'conversations', convId);
    const snap = await getDoc(convRef);

    if (snap.exists()) {
      return {
        success: true,
        data: { id: snap.id, ...snap.data() } as Conversation,
      };
    }

    const newConv: Conversation = {
      id: convId,
      participants: [athleteId, coachId],
      athleteId,
      athleteName,
      athleteSport,
      coachId,
      coachName,
      lastMessageText: 'Conversation started',
      lastMessageTime: new Date().toISOString(),
      lastSenderId: athleteId,
      unreadCountForAthlete: 0,
      unreadCountForCoach: 0,
      updatedAt: new Date().toISOString(),
    };

    await setDoc(convRef, newConv);

    return {
      success: true,
      data: newConv,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

export const subscribeToMessages = (
  conversationId: string,
  onMessagesUpdate: (messages: ChatMessage[]) => void,
  onError?: (err: Error) => void
) => {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const msgs: ChatMessage[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          conversationId,
          senderId: String(data.senderId || ''),
          senderName: String(data.senderName || ''),
          senderRole: (data.senderRole as UserRole) || 'ATHLETE',
          recipientId: String(data.recipientId || ''),
          text: String(data.text || ''),
          createdAt: data.createdAt ? String(data.createdAt) : new Date().toISOString(),
          read: Boolean(data.read),
        };
      });
      onMessagesUpdate(msgs);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
};

export const sendChatMessage = async (
  conversationId: string,
  senderId: string,
  senderName: string,
  senderRole: UserRole,
  recipientId: string,
  text: string
): Promise<ServiceResponse<void>> => {
  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const convRef = doc(db, 'conversations', conversationId);

    const now = new Date().toISOString();

    await addDoc(messagesRef, {
      senderId,
      senderName,
      senderRole,
      recipientId,
      text: text.trim(),
      createdAt: now,
      serverTime: serverTimestamp(),
      read: false,
    });

    await updateDoc(convRef, {
      lastMessageText: text.trim(),
      lastMessageTime: now,
      lastSenderId: senderId,
      updatedAt: now,
    });

    return { success: true, data: undefined };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

export const getUserConversations = async (
  userId: string
): Promise<ServiceResponse<Conversation[]>> => {
  try {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId)
    );
    const snap = await getDocs(q);

    const convs: Conversation[] = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Conversation[];

    return { success: true, data: convs };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};
