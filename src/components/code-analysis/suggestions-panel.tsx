'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Lightbulb, AlertTriangle, Shield, Zap } from 'lucide-react';

interface Suggestion {
  id: string;
  type: 'refactor' | 'security' | 'performance' | 'maintainability';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  suggestedFix?: string;
  lineNumber?: number;
  codeSnippet?: string;
  modernizationApproach?: string;
}

interface SuggestionsPanelProps {
  suggestions: Suggestion[];
  className?: string;
}

export function SuggestionsPanel({ suggestions, className }: SuggestionsPanelProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<string>('all');

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'refactor': return <Lightbulb className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'performance': return <Zap className="w-4 h-4" />;
      case 'maintainability': return <AlertTriangle className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'refactor': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'security': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'performance': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'maintainability': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const filteredSuggestions = suggestions.filter(suggestion => 
    filter === 'all' || suggestion.type === filter
  );

  const suggestionCounts = suggestions.reduce((acc, suggestion) => {
    acc[suggestion.type] = (acc[suggestion.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lightbulb className="w-5 h-5" />
          <span>AI Suggestions</span>
          <Badge variant="secondary">{suggestions.length}</Badge>
        </CardTitle>
        
        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All ({suggestions.length})
          </Button>
          {Object.entries(suggestionCounts).map(([type, count]) => (
            <Button
              key={type}
              size="sm"
              variant={filter === type ? 'default' : 'outline'}
              onClick={() => setFilter(type)}
            >
              {getTypeIcon(type)}
              <span className="ml-1 capitalize">{type} ({count})</span>
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredSuggestions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No suggestions available</p>
            </div>
          ) : (
            filteredSuggestions.map((suggestion) => (
              <Collapsible key={suggestion.id}>
                <CollapsibleTrigger asChild>
                  <div 
                    className="flex items-start justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleExpanded(suggestion.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getTypeIcon(suggestion.type)}
                        <h4 className="font-medium">{suggestion.title}</h4>
                        {suggestion.lineNumber && (
                          <span className="text-xs text-muted-foreground">
                            Line {suggestion.lineNumber}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getTypeColor(suggestion.type)}>
                          {suggestion.type}
                        </Badge>
                        <Badge className={getSeverityColor(suggestion.severity)}>
                          {suggestion.severity}
                        </Badge>
                      </div>
                    </div>
                    <div className="ml-4">
                      {expandedItems.has(suggestion.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-3 mt-2 bg-muted/30 rounded-lg space-y-3">
                    <p className="text-sm">{suggestion.description}</p>
                    
                    {suggestion.codeSnippet && (
                      <div>
                        <h5 className="text-xs font-semibold mb-1">Code:</h5>
                        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                          {suggestion.codeSnippet}
                        </pre>
                      </div>
                    )}
                    
                    {suggestion.suggestedFix && (
                      <div>
                        <h5 className="text-xs font-semibold mb-1">Suggested Fix:</h5>
                        <p className="text-xs text-muted-foreground">
                          {suggestion.suggestedFix}
                        </p>
                      </div>
                    )}
                    
                    {suggestion.modernizationApproach && (
                      <div>
                        <h5 className="text-xs font-semibold mb-1">Modernization Approach:</h5>
                        <p className="text-xs text-muted-foreground">
                          {suggestion.modernizationApproach}
                        </p>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
