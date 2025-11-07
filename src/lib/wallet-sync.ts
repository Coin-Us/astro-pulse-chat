import { useAccount } from 'wagmi';
import { supabase } from './supabase';

/**
 * Hook to sync wallet connection with your database
 * Call this when wallet connects to create/update user record
 */
export function useWalletSync() {
  const { address, isConnected } = useAccount();

  const syncWallet = async () => {
    if (!isConnected || !address) {
      return null;
    }

    try {
      // Check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', address.toLowerCase())
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = not found, which is fine
        console.error('Error fetching user:', fetchError);
        return null;
      }

      if (existingUser) {
        // Update last login
        const { data, error } = await supabase
          .from('users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('wallet_address', address.toLowerCase())
          .select()
          .single();

        if (error) {
          console.error('Error updating user:', error);
          return null;
        }

        return data;
      } else {
        // Create new user
        const { data, error } = await supabase
          .from('users')
          .insert({
            wallet_address: address.toLowerCase(),
            preferences: {},
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating user:', error);
          return null;
        }

        return data;
      }
    } catch (error) {
      console.error('Error syncing wallet:', error);
      return null;
    }
  };

  return { syncWallet, address, isConnected };
}

/**
 * Link a conversation to the connected wallet
 */
export async function linkConversationToWallet(
  conversationId: string,
  walletAddress: string
) {
  const { error } = await supabase
    .from('conversations')
    .update({ wallet_address: walletAddress.toLowerCase() })
    .eq('id', conversationId);

  if (error) {
    console.error('Error linking conversation:', error);
    return false;
  }

  return true;
}

/**
 * Get user preferences
 */
export async function getUserPreferences(walletAddress: string) {
  const { data, error } = await supabase
    .from('users')
    .select('preferences')
    .eq('wallet_address', walletAddress.toLowerCase())
    .single();

  if (error) {
    console.error('Error fetching preferences:', error);
    return {};
  }

  return data?.preferences || {};
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  walletAddress: string,
  preferences: Record<string, any>
) {
  const { error } = await supabase
    .from('users')
    .update({ preferences })
    .eq('wallet_address', walletAddress.toLowerCase());

  if (error) {
    console.error('Error updating preferences:', error);
    return false;
  }

  return true;
}
