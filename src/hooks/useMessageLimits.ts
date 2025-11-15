import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface MessageLimitResult {
  messagesRemaining: number;
  canSend: boolean;
  dailyLimit: number;
  messagesSent: number;
  bonusMessages: number;
  levelBonus: number;
  totalAvailable: number;
}

export const useMessageLimits = (userId: string | undefined, userLevel: string): MessageLimitResult => {
  const [messagesSent, setMessagesSent] = useState(0);
  const [bonusMessages, setBonusMessages] = useState(0);
  const [levelBonus, setLevelBonus] = useState(0);
  const [totalAvailable, setTotalAvailable] = useState(30);
  
  const dailyLimit = 30; // New base limit

  useEffect(() => {
    if (!userId) return;

    const checkLimit = async () => {
      try {
        // Use the new get_message_status function with user level
        const { data: statusData, error: statusError } = await supabase.rpc('get_message_status', {
          p_user_id: userId,
          p_user_level: userLevel
        });

        if (!statusError && statusData) {
          // Use the new system with bonus messages and level bonuses
          setMessagesSent(statusData.messages_sent || 0);
          setBonusMessages(statusData.bonus_messages || 0);
          setLevelBonus(statusData.level_bonus || 0);
          setTotalAvailable(statusData.total_available || 30);
        } else {
          console.error('Error getting message status:', statusError);
          // Fallback to checking daily_message_limits directly
          const today = new Date().toISOString().split('T')[0];
          const { data: limitData } = await supabase
            .from('daily_message_limits')
            .select('messages_sent, bonus_messages')
            .eq('user_id', userId)
            .eq('date', today)
            .single();
            
          if (limitData) {
            setMessagesSent(limitData.messages_sent || 0);
            setBonusMessages(limitData.bonus_messages || 0);
            // Calculate level bonus manually for fallback
            const levelBonusValue = userLevel === 'Oro' ? 10 : userLevel === 'Plata' ? 5 : 0;
            setLevelBonus(levelBonusValue);
            setTotalAvailable(Math.min(30 + levelBonusValue, 30) + (limitData.bonus_messages || 0));
          }
        }
      } catch (error) {
        console.error('Error checking message limit:', error);
      }
    };

    checkLimit();

    const interval = setInterval(checkLimit, 10000);

    return () => clearInterval(interval);
  }, [userId, userLevel]);

  const messagesRemaining = Math.max(0, totalAvailable - messagesSent);
  const canSend = messagesRemaining > 0;

  return {
    messagesRemaining,
    canSend,
    dailyLimit,
    messagesSent,
    bonusMessages,
    levelBonus,
    totalAvailable
  };
};
