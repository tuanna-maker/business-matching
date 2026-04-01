'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import {
  Search,
  MapPin,
  TrendingUp,
  Users,
  DollarSign,
  Briefcase,
  Star,
  Filter,
  X,
} from 'lucide-react';

interface DirectoryUser {
  id: string;
  name: string;
  email: string;
  role: 'investor' | 'startup';
  bio?: string;
  location?: string;
  website?: string;
  portfolio_count?: number;
  investments_total?: number;
  iec_level: number;
  verified: boolean;
  industries?: string[];
  stage_focus?: string[];
  created_at: string;
}

export default function DirectoryPage() {
  const { user } = useAuth();
  const [directory, setDirectory] = useState<DirectoryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'investor' | 'startup'>('investor');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const fetchDirectory = async () => {
    try {
      setLoading(true);
      // p0-6: BE có /directory/investors và /directory/startups (không phải /directory?role=)
      const path =
        selectedRole === 'investor'
          ? '/directory/investors'
          : selectedRole === 'startup'
          ? '/directory/startups'
          : '/directory/investors'; // fallback 'all' → investors
      const data = await api.get<DirectoryUser[]>(path);
      setDirectory(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load directory');
      console.error('Fetch directory error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectory();
  }, [selectedRole]);

  const allIndustries = useMemo(() => {
    const industries = new Set<string>();
    directory.forEach((u) => {
      u.industries?.forEach((ind) => industries.add(ind));
    });
    return Array.from(industries).sort();
  }, [directory]);

  const filteredDirectory = useMemo(() => {
    return directory
      .filter(
        (u) =>
          (u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.bio?.toLowerCase().includes(search.toLowerCase())) &&
          (selectedIndustries.length === 0 ||
            (u.industries && selectedIndustries.some((ind) => u.industries?.includes(ind))))
      )
      .sort((a, b) => {
        // Verified first, then by IEC level
        if (a.verified !== b.verified) return a.verified ? -1 : 1;
        return b.iec_level - a.iec_level;
      });
  }, [directory, search, selectedIndustries]);

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(industry)
        ? prev.filter((i) => i !== industry)
        : [...prev, industry]
    );
  };

  const getRoleIcon = (role: string) => {
    return role === 'investor' ? <DollarSign className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />;
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'investor'
      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      : 'bg-green-500/20 text-green-300 border-green-500/30';
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-20 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Directory</h1>
          <p className="text-slate-400">
            Discover {selectedRole === 'investor' ? 'investors' : selectedRole === 'startup' ? 'startups' : 'members'} in our community
          </p>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4 mb-8">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or bio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/80 border border-slate-200 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap gap-3">
            {/* Role Buttons */}
            {[
              { label: 'All', value: 'all' },
              { label: 'Investors', value: 'investor' },
              { label: 'Startups', value: 'startup' },
            ].map((role) => (
              <motion.button
                key={role.value}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedRole(role.value as any)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all border ${
                  selectedRole === role.value
                    ? 'bg-blue-500/30 border-blue-500/50 text-blue-300'
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600/50'
                }`}
              >
                {role.label}
              </motion.button>
            ))}

            {/* Filter Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all border flex items-center gap-2 ${
                showFilters
                  ? 'bg-amber-500/30 border-amber-500/50 text-amber-300'
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600/50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {selectedIndustries.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-slate-900/50 rounded text-xs">
                  {selectedIndustries.length}
                </span>
              )}
            </motion.button>
          </div>

          {/* Industry Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30"
            >
              <p className="text-sm font-semibold text-slate-300 mb-3">Industries</p>
              <div className="flex flex-wrap gap-2">
                {allIndustries.map((industry) => (
                  <motion.button
                    key={industry}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => toggleIndustry(industry)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                      selectedIndustries.includes(industry)
                        ? 'bg-blue-500/30 border-blue-500/50 text-blue-300'
                        : 'bg-slate-700/30 border-slate-600/50 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {industry}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Results Counter */}
        <p className="text-sm text-slate-400 mb-6">
          Showing {filteredDirectory.length} result{filteredDirectory.length !== 1 ? 's' : ''}
        </p>

        {/* Directory Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, repeat: Infinity }}
                className="h-64 bg-slate-800/30 rounded-lg border border-slate-700/30"
              />
            ))}
          </div>
        ) : filteredDirectory.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 rounded-lg border border-slate-700/30 bg-slate-800/10"
          >
            <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">No results found</p>
            <p className="text-slate-500 text-sm">Try adjusting your search or filters</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDirectory.map((member, idx) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-6 rounded-lg border border-slate-700/30 bg-slate-800/20 hover:bg-slate-800/40 transition-all hover:shadow-lg hover:shadow-slate-900/50 flex flex-col"
              >
                {/* Header with Role Badge */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <Link href={`/profile/${member.id}`}>
                      <h3 className="text-lg font-semibold text-slate-900 hover:text-blue-700 transition-colors truncate">
                        {member.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-slate-400">{member.email}</p>
                  </div>

                  <span
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border flex-shrink-0 ${getRoleBadgeColor(member.role)}`}
                  >
                    {getRoleIcon(member.role)}
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </span>
                </div>

                {/* IEC Level & Verified */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-semibold text-amber-300">Level {member.iec_level}</span>
                  </div>
                  {member.verified && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-green-500/20 text-green-300 text-xs font-semibold border border-green-500/30">
                      ✓ Verified
                    </div>
                  )}
                </div>

                {/* Bio */}
                {member.bio && (
                  <p className="text-sm text-slate-300 mb-3 line-clamp-2">{member.bio}</p>
                )}

                {/* Location */}
                {member.location && (
                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    {member.location}
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4 pt-3 border-t border-slate-700/30">
                  {member.role === 'investor' ? (
                    <>
                      <div>
                        <p className="text-xs text-slate-500">Portfolio</p>
                        <p className="text-lg font-bold text-slate-900">{member.portfolio_count || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Invested</p>
                        <p className="text-lg font-bold text-slate-900">
                          ${(member.investments_total || 0) / 1000000}M
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-xs text-slate-500">Stage</p>
                        <p className="text-sm font-bold text-slate-900">
                          {member.stage_focus?.[0] || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Industries</p>
                        <p className="text-sm font-bold text-slate-900">
                          {member.industries?.length || 0}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Industries */}
                {member.industries && member.industries.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {member.industries.slice(0, 3).map((ind) => (
                      <span
                        key={ind}
                        className="px-2 py-0.5 rounded text-xs bg-slate-700/30 text-slate-300"
                      >
                        {ind}
                      </span>
                    ))}
                    {member.industries.length > 3 && (
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-700/30 text-slate-300">
                        +{member.industries.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Action Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="mt-auto"
                >
                  <Link
                    href={`/profile/${member.id}`}
                    className="w-full px-3 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-medium border border-blue-500/30 transition-colors text-center text-sm"
                  >
                    View Profile
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
