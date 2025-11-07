# Database Schema Documentation

## Overview

The chat application uses Supabase PostgreSQL database to store conversations and messages persistently.

## Tables

### `conversations`

Stores individual chat conversations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `user_id` | TEXT | Optional user identifier (for future auth) |
| `title` | TEXT | Conversation title (auto-generated from first message) |
| `created_at` | TIMESTAMPTZ | When the conversation was created |
| `updated_at` | TIMESTAMPTZ | Last update timestamp (auto-updated) |

**Indexes:**
- `idx_conversations_user_id` - For filtering by user
- `idx_conversations_updated_at` - For sorting by recent activity

### `messages`

Stores individual messages within conversations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `conversation_id` | UUID | Foreign key to conversations table |
| `role` | TEXT | Message role: 'user', 'assistant', or 'system' |
| `content` | TEXT | Message content |
| `created_at` | TIMESTAMPTZ | When the message was created |

**Constraints:**
- `role` must be one of: 'user', 'assistant', 'system'
- `conversation_id` cascades on delete (deleting conversation deletes all messages)

**Indexes:**
- `idx_messages_conversation_id` - For fetching conversation messages
- `idx_messages_created_at` - For chronological ordering

## Security

### Row Level Security (RLS)

Both tables have RLS enabled with permissive policies for development:
- All operations (SELECT, INSERT, UPDATE, DELETE) are allowed for all users
- **Note:** You should add proper authentication and restrict these policies in production

### Future Authentication

The schema is designed to support user authentication:
1. Add Supabase Auth
2. Update RLS policies to filter by `auth.uid()`
3. Set `user_id` to authenticated user's ID

Example production policy:
```sql
-- Only allow users to see their own conversations
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid()::text = user_id);
```

## Usage Examples

### JavaScript/TypeScript

The `chat-storage.ts` utility provides helper functions:

```typescript
import { 
  createConversation, 
  saveMessage, 
  getMessages,
  getConversations 
} from '@/lib/chat-storage';

// Create new conversation
const conversation = await createConversation('Bitcoin Discussion');

// Save messages
await saveMessage(conversation.id, 'user', 'What is Bitcoin?');
await saveMessage(conversation.id, 'assistant', 'Bitcoin is a...');

// Get all messages
const messages = await getMessages(conversation.id);

// Get all conversations
const conversations = await getConversations();
```

## Migrations

The initial migration creates all tables, indexes, and policies.

**Migration name:** `create_chat_tables`

To apply manually:
```bash
# Using Supabase CLI
supabase db reset
```

## Performance Considerations

1. **Indexes** - Properly indexed for common queries
2. **Timestamps** - Automatic timestamp management
3. **Cascade Deletes** - Efficient cleanup when deleting conversations
4. **RLS** - Row-level security for data isolation

## Future Enhancements

Potential schema additions:

1. **User Preferences Table**
   - Store user settings, themes, etc.

2. **Message Metadata**
   - Token count
   - Model version
   - Response time

3. **Conversation Tags**
   - Categorize conversations
   - Many-to-many relationship

4. **Message Reactions**
   - Like/dislike feedback
   - For training/improvement

5. **Shared Conversations**
   - Public sharing links
   - Read-only access
