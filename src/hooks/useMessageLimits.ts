import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const MESSAGE_LIMITS: Record<string, number> = {
  'Bronce': 1,
  'Plata': 5,
  'Oro': Infinity
};

interface MessageLimitResult {
  messagesRemaining: number;
  canSend: boolean;
  dailyLimit: number;
  messagesSent: number;
}

export const useMessageLimits = (userId: string | undefined, userLevel: string): MessageLimitResult => {
  const [messagesSent, setMessagesSent] = useState(0);
  const dailyLimit = MESSAGE_LIMITS[userLevel] || 1;

  useEffect(() => {
    if (!userId) return;

    const checkLimit = async () => {
      try {
        const { data, error } = await supabase.rpc('get_daily_message_count', {
          p_user_id: userId
        });

        if (error) throw error;
        setMessagesSent(data || 0);
      } catch (error) {
        console.error('Error checking message limit:', error);
      }
    };

    checkLimit();

    const interval = setInterval(checkLimit, 10000);

    return () => clearInterval(interval);
  }, [userId]);

  const messagesRemaining = dailyLimit === Infinity ? Infinity : Math.max(0, dailyLimit - messagesSent);
  const canSend = messagesRemaining > 0 || dailyLimit === Infinity;

  return {
    messagesRemaining,
    canSend,
    dailyLimit,
    messagesSent
  };
};
