'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Search, Loader, TrendingUp, History, X } from 'lucide-react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

interface SearchResult {
  id: string;
  type: 'project' | 'startup' | 'investor' | 'notification' | 'match';
  title: string;
  description?: string;
  link: string;
  icon?: string;
}

export function GlobalSearchBar() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const handleSearch = async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    try {
      setLoading(true);
      setShowResults(true);

      // Parallel searches across all endpoints
      const [projectsRes, notificationsRes, matchesRes] = await Promise.all([
        api.get<any[]>(`/projects?search=${encodeURIComponent(q)}&limit=5`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        }).catch(() => []),
        api.get<any[]>(`/notifications?limit=3`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        }).catch(() => []),
        api.get<any[]>(`/matching/matches?limit=3`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        }).catch(() => []),
      ]);

      const combinedResults: SearchResult[] = [];

      // Add projects
      projectsRes?.forEach((p: any) => {
        combinedResults.push({
          id: p.id,
          type: 'project',
          title: p.name || p.title,
          description: p.description,
          link: `/projects/${p.id}`,
        });
      });

      // Add notifications
      notificationsRes?.forEach((n: any) => {
        if (n.title.toLowerCase().includes(q.toLowerCase())) {
          combinedResults.push({
            id: n.id,
            type: 'notification',
            title: n.title,
            description: n.message,
            link: '/notifications',
          });
        }
      });

      // Add matches
      matchesRes?.forEach((m: any) => {
        combinedResults.push({
          id: m.id,
          type: 'match',
          title: `Match: ${m.project_name || 'Project'} + ${m.startup_name || 'Startup'}`,
          description: `Status: ${m.status}`,
          link: `/matches/${m.id}`,
        });
      });

      setResults(combinedResults.slice(0, 8));
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    handleSearch(value);
  };

  const handleRecentSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    handleSearch(searchTerm);
    if (!recentSearches.includes(searchTerm)) {
      setRecentSearches((prev) => [searchTerm, ...prev].slice(0, 5));
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project':
        return 'text-blue-400';
      case 'startup':
        return 'text-green-400';
      case 'investor':
        return 'text-purple-400';
      case 'notification':
        return 'text-amber-400';
      case 'match':
        return 'text-cyan-400';
      default:
        return 'text-slate-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project':
        return '📊';
      case 'startup':
        return '🚀';
      case 'investor':
        return '💼';
      case 'notification':
        return '🔔';
      case 'match':
        return '🤝';
      default:
        return '⭐';
    }
  };

  if (!user) return null;

  return (
    <div className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search projects, matches, notifications..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => query && setShowResults(true)}
          className="w-full pl-10 pr-10 py-2 rounded-lg bg-white/80 border border-slate-200 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-brand/50 transition-all focus:ring-2 focus:ring-blue-500/20"
        />
        {query && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
          >
            <X className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-lg bg-white border border-slate-200/70 shadow-2xl shadow-slate-900/10 z-50 max-h-96 overflow-y-auto"
          >
            {loading && (
              <div className="p-4 text-center">
                <Loader className="w-5 h-5 text-blue-400 animate-spin mx-auto" />
              </div>
            )}

            {!loading && results.length === 0 && query && (
              <div className="p-4 text-center">
                <p className="text-slate-400 text-sm">No results found for "{query}"</p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="divide-y divide-slate-700/30">
                {results.map((result, idx) => (
                  <motion.div
                    key={`${result.type}-${result.id}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link href={result.link}>
                      <div className="px-4 py-3 hover:bg-slate-800/50 transition-colors cursor-pointer">
                        <div className="flex items-start gap-3">
                          <span className="text-lg mt-0.5">{getTypeIcon(result.type)}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-slate-900 font-medium truncate">{result.title}</h4>
                            {result.description && (
                              <p className="text-slate-400 text-sm truncate">{result.description}</p>
                            )}
                          </div>
                          <span className={`text-xs font-semibold ${getTypeColor(result.type)}`}>
                            {result.type}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {!loading && !query && recentSearches.length > 0 && (
              <div className="p-3 border-t border-slate-700/30">
                <p className="text-xs font-semibold text-slate-400 mb-2 px-1">
                  <History className="w-3 h-3 inline mr-1" />
                  Recent
                </p>
                <div className="space-y-1">
                  {recentSearches.map((search) => (
                    <motion.button
                      key={search}
                      whileHover={{ x: 2 }}
                      onClick={() => handleRecentSearch(search)}
                      className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/30 rounded transition-colors"
                    >
                      {search}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {!loading && !query && recentSearches.length === 0 && (
              <div className="p-4 text-center">
                <TrendingUp className="w-5 h-5 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">Start typing to search...</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {showResults && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={clearSearch}
          className="fixed inset-0 z-40"
        />
      )}
    </div>
  );
}

export default GlobalSearchBar;
