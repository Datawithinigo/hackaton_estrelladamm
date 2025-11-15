import { useMemo } from 'react';
import { User } from '../lib/supabase';
import { useFilters } from '../contexts/FilterContext';

/**
 * Hook to get the count of nearby users based on current filters
 * @param users - Array of all users
 * @param currentUserId - ID of the current user (to exclude from count)
 * @returns number of users that match the current filter criteria
 */
export const useNearbyUsers = (users: (User & { id: string })[], currentUserId?: string): number => {
  const { applyFilters } = useFilters();

  const nearbyUsersCount = useMemo(() => {
    const filteredUsers = applyFilters(users, currentUserId);
    return filteredUsers.length;
  }, [users, currentUserId, applyFilters]);

  return nearbyUsersCount;
};