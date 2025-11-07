import { supabase } from './supabase';

export interface Conversation {
  id: string;
  user_id: string | null;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

/**
 * Create a new conversation
 */
export async function createConversation(title?: string, userId?: string): Promise<Conversation> {
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      title: title || 'New Conversation',
      user_id: userId || null,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create conversation: ${error.message}`);
  return data;
}

/**
 * Get a conversation by ID
 */
export async function getConversation(conversationId: string): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(`Failed to get conversation: ${error.message}`);
  }
  return data;
}

/**
 * Get all conversations for a user (or all if no userId)
 */
export async function getConversations(userId?: string): Promise<Conversation[]> {
  let query = supabase
    .from('conversations')
    .select('*')
    .order('updated_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) throw new Error(`Failed to get conversations: ${error.message}`);
  return data || [];
}

/**
 * Update conversation title
 */
export async function updateConversationTitle(
  conversationId: string,
  title: string
): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .update({ title })
    .eq('id', conversationId);

  if (error) throw new Error(`Failed to update conversation: ${error.message}`);
}

/**
 * Delete a conversation (will cascade delete all messages)
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId);

  if (error) throw new Error(`Failed to delete conversation: ${error.message}`);
}

/**
 * Save a message to the database
 */
export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant' | 'system',
  content: string
): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role,
      content,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to save message: ${error.message}`);
  
  // Update conversation's updated_at timestamp
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  return data;
}

/**
 * Get all messages for a conversation
 */
export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Failed to get messages: ${error.message}`);
  return data || [];
}

/**
 * Delete a message
 */
export async function deleteMessage(messageId: string): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId);

  if (error) throw new Error(`Failed to delete message: ${error.message}`);
}

/**
 * Generate a conversation title based on the first user message
 */
export function generateConversationTitle(firstMessage: string): string {
  // Take first 50 characters or up to first question mark/period
  const truncated = firstMessage.substring(0, 50);
  const endIndex = Math.min(
    truncated.indexOf('?') !== -1 ? truncated.indexOf('?') + 1 : Infinity,
    truncated.indexOf('.') !== -1 ? truncated.indexOf('.') + 1 : Infinity,
    truncated.length
  );
  
  let title = firstMessage.substring(0, endIndex).trim();
  if (firstMessage.length > endIndex) {
    title += '...';
  }
  
  return title || 'New Conversation';
}
