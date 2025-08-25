'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  X, 
  Calendar,
  FileText,
  BarChart3,
  AlertTriangle
} from 'lucide-react';

interface FilterOptions {
  search: string;
  complexity: string[];
  fileTypes: string[];
  status: string[];
  dateRange: string;
}

interface FilterPanelProps {
  onFiltersChange?: (filters: FilterOptions) => void;
  showAdvanced?: boolean;
}

export function FilterPanel({ onFiltersChange, showAdvanced = false }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(showAdvanced);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    complexity: [],
    fileTypes: [],
    status: [],
    dateRange: 'all',
  });

  const complexityLevels = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' },
    { value: 'critical', label: 'Critical', color: 'bg-red-200 text-red-900' },
  ];

  const fileTypes = [
    { value: 'pl', label: 'Perl Scripts (.pl)', icon: '🐪' },
    { value: 'pm', label: 'Perl Modules (.pm)', icon: '🐪' },
    { value: 'xml', label: 'TIBCO XML (.xml)', icon: '🔧' },
    { value: 'ktr', label: 'Pentaho Transform (.ktr)', icon: '🔄' },
    { value: 'kjb', label: 'Pentaho Jobs (.kjb)', icon: '🔄' },
  ];

  const statusOptions = [
    { value: 'analyzed', label: 'Analyzed', icon: '✅' },
    { value: 'processing', label: 'Processing', icon: '⏳' },
    { value: 'failed', label: 'Failed', icon: '❌' },
    { value: 'pending', label: 'Pending', icon: '⏸️' },
  ];

  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
  ];

  const updateFilter = <K extends keyof FilterOptions>(
    key: K,
    value: FilterOptions[K]
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const toggleArrayFilter = <K extends keyof FilterOptions>(
    key: K,
    value: string
  ) => {
    if (Array.isArray(filters[key])) {
      const currentArray = filters[key] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      updateFilter(key, newArray as FilterOptions[K]);
    }
  };

  const clearFilters = () => {
    const clearedFilters: FilterOptions = {
      search: '',
      complexity: [],
      fileTypes: [],
      status: [],
      dateRange: 'all',
    };
    setFilters(clearedFilters);
    onFiltersChange?.(clearedFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    count += filters.complexity.length;
    count += filters.fileTypes.length;
    count += filters.status.length;
    if (filters.dateRange !== 'all') count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Filter and search through your files
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Hide' : 'Show'} Filters
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isExpanded && (
          <>
            {/* Complexity Levels */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <BarChart3 className="w-4 h-4 mr-1" />
                Complexity Level
              </label>
              <div className="flex flex-wrap gap-2">
                {complexityLevels.map((level) => (
                  <Button
                    key={level.value}
                    variant={filters.complexity.includes(level.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleArrayFilter('complexity', level.value)}
                    className="h-8"
                  >
                    {level.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* File Types */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                File Types
              </label>
              <div className="space-y-1">
                {fileTypes.map((type) => (
                  <label key={type.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.fileTypes.includes(type.value)}
                      onChange={() => toggleArrayFilter('fileTypes', type.value)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm flex items-center">
                      <span className="mr-1">{type.icon}</span>
                      {type.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <Button
                    key={status.value}
                    variant={filters.status.includes(status.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleArrayFilter('status', status.value)}
                    className="h-8"
                  >
                    <span className="mr-1">{status.icon}</span>
                    {status.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => updateFilter('dateRange', e.target.value)}
                className="w-full p-2 border rounded-md text-sm"
              >
                {dateRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}