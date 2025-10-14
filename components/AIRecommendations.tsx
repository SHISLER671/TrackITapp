'use client';

import React, { useState, useEffect } from 'react';
import { getKegRecommendations } from '@/lib/ai-assistant';
import { supabase } from '@/lib/supabase';

interface AIRecommendationsProps {
  onApply: (params: any) => void;
}

export default function AIRecommendations({ onApply }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from('kegs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const recs = await getKegRecommendations(data || []);
      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyRecommendation = (rec: any) => {
    // Parse recommendation to extract params
    const params: any = {};
    
    const abvMatch = rec.suggestion.match(/(\d+\.?\d*)\s*%\s*ABV/i);
    if (abvMatch) params.abv = parseFloat(abvMatch[1]);
    
    const ibuMatch = rec.suggestion.match(/(\d+)\s*IBU/i);
    if (ibuMatch) params.ibu = parseInt(ibuMatch[1]);
    
    if (rec.suggestion.includes('IPA')) params.type = 'IPA';
    else if (rec.suggestion.includes('Stout')) params.type = 'Stout';
    else if (rec.suggestion.includes('Lager')) params.type = 'Lager';
    else if (rec.suggestion.includes('Pale Ale')) params.type = 'Pale Ale';
    else if (rec.suggestion.includes('Wheat')) params.type = 'Wheat Beer';
    else if (rec.suggestion.includes('Sour')) params.type = 'Sour';
    
    if (rec.suggestion.includes('1/2')) params.keg_size = '1/2BBL';
    else if (rec.suggestion.includes('1/4')) params.keg_size = '1/4BBL';
    else if (rec.suggestion.includes('1/6')) params.keg_size = '1/6BBL';
    
    onApply(params);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <div className="animate-spin">🤖</div>
          <span className="text-purple-700 font-medium">AI analyzing your brewing patterns...</span>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <h3 className="font-bold text-purple-900">AI Recommendations</h3>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
        >
          {expanded ? 'Show Less' : 'Show All'}
        </button>
      </div>

      <div className="space-y-3">
        {recommendations.slice(0, expanded ? recommendations.length : 1).map((rec, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-4 border border-purple-200 hover:border-purple-400 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="font-medium text-gray-900 mb-1">{rec.suggestion}</div>
                <div className="text-sm text-gray-600 mb-2">{rec.reason}</div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-purple-600 font-medium">
                    {Math.round(rec.confidence * 100)}% confidence
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-purple-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${rec.confidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={() => applyRecommendation(rec)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium whitespace-nowrap"
              >
                Apply
              </button>
            </div>
          </div>
        ))}
      </div>

      {!expanded && recommendations.length > 1 && (
        <div className="mt-3 text-center text-sm text-purple-600">
          +{recommendations.length - 1} more recommendation{recommendations.length - 1 !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
