import { useFilters } from '../contexts/FilterContext';
import { Filter, X } from 'lucide-react';

interface FilterStatusProps {
  className?: string;
}

export default function FilterStatus({ className = '' }: FilterStatusProps) {
  const { filters, clearFilters } = useFilters();
  const { ageRange, genderFilter } = filters;

  const hasActiveFilters = 
    ageRange[0] !== 18 || 
    ageRange[1] !== 99 || 
    genderFilter !== 'todos';

  if (!hasActiveFilters) {
    return null;
  }

  const getFilterText = () => {
    const filters: string[] = [];
    
    if (ageRange[0] !== 18 || ageRange[1] !== 99) {
      filters.push(`${ageRange[0]} - ${ageRange[1]} años`);
    }
    
    if (genderFilter !== 'todos') {
      filters.push(genderFilter === 'hombre' ? 'Hombres' : 'Mujeres');
    }
    
    return filters.join(' • ');
  };

  return (
    <div className={`flex items-center gap-3 mb-4 ${className}`}>
      <div className="flex items-center gap-2 bg-[#FFF5F5] border border-[#C8102E]/20 rounded-lg px-4 py-2 text-sm">
        <Filter className="w-4 h-4 text-[#C8102E]" />
        <span className="text-[#666666]">
          Filtros activos: <span className="font-medium text-[#C8102E]">{getFilterText()}</span>
        </span>
        <button
          onClick={clearFilters}
          className="ml-2 p-1 hover:bg-[#C8102E]/10 rounded-md transition-colors"
          title="Limpiar filtros"
        >
          <X className="w-3 h-3 text-[#C8102E]" />
        </button>
      </div>
    </div>
  );
}