import { Conversation } from '@/types/chat';

export const updateConversation = (
  updatedConversation: Conversation,
  allConversations: Conversation[],
) => {
  const updatedConversations = allConversations.map((c) => {
    if (c.id === updatedConversation.id) {
      return updatedConversation;
    }

    return c;
  });

  saveConversation(updatedConversation);
  saveConversations(updatedConversations);

  return {
    single: updatedConversation,
    all: updatedConversations,
  };
};

declare global {
  interface Window {
    chatUniqId: string;
  }
}

export const saveConversation = (conversation: Conversation) => {
  localStorage.setItem('selectedConversation' + window.chatUniqId, JSON.stringify(conversation));
};

export const saveConversations = (conversations: Conversation[]) => {
  localStorage.setItem('conversationHistory' + window.chatUniqId, JSON.stringify(conversations));
};
