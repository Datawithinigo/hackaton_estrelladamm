import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../lib/supabase';

export interface FilterState {
  ageRange: [number, number];
  genderFilter: 'todos' | 'hombre' | 'mujer';
}

interface FilterContextType {
  filters: FilterState;
  setAgeRange: (range: [number, number]) => void;
  setGenderFilter: (gender: 'todos' | 'hombre' | 'mujer') => void;
  clearFilters: () => void;
  applyFilters: (users: (User & { id: string })[], currentUserId?: string) => (User & { id: string })[];
}

const defaultFilters: FilterState = {
  ageRange: [18, 99],
  genderFilter: 'todos'
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

interface FilterProviderProps {
  children: React.ReactNode;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
  const [filters, setFilters] = useState<FilterState>(() => {
    // Load filters from localStorage if available
    const savedFilters = localStorage.getItem('userFilters');
    if (savedFilters) {
      try {
        return JSON.parse(savedFilters);
      } catch {
        return defaultFilters;
      }
    }
    return defaultFilters;
  });

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('userFilters', JSON.stringify(filters));
  }, [filters]);

  const setAgeRange = (range: [number, number]) => {
    setFilters(prev => ({ ...prev, ageRange: range }));
  };

  const setGenderFilter = (gender: 'todos' | 'hombre' | 'mujer') => {
    setFilters(prev => ({ ...prev, genderFilter: gender }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const applyFilters = (users: (User & { id: string })[], currentUserId?: string) => {
    return users.filter(user => {
      // Exclude current user
      if (currentUserId && user.id === currentUserId) return false;
      
      // Only show users who want to be visible on map
      if (!user.visible_on_map) return false;
      
      // Apply age filter
      if (user.age !== undefined && (user.age < filters.ageRange[0] || user.age > filters.ageRange[1])) return false;
      
      // Apply gender filter
      if (filters.genderFilter !== 'todos' && user.gender !== filters.genderFilter) return false;
      
      return true;
    });
  };

  const value: FilterContextType = {
    filters,
    setAgeRange,
    setGenderFilter,
    clearFilters,
    applyFilters
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};