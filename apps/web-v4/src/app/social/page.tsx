'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { Heart, MessageCircle, Share2, User, Users, TrendingUp, Zap } from 'lucide-react';

interface ActivityFeed {
  id: string;
  type: 'match_created' | 'match_progressed' | 'project_launched' | 'user_followed' | 'message_sent';
  actor_id: string;
  actor_name: string;
  actor_type: 'investor' | 'startup';
  action: string;
  target?: string;
  target_id?: string;
  liked: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'investor' | 'startup' | 'admin';
  followers_count: number;
  following_count: number;
  is_following: boolean;
}

export default function SocialFeedPage() {
  const { user } = useAuth();
  const [feed, setFeed] = useState<ActivityFeed[]>([]);
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());

  const fetchFeed = async () => {
    try {
      const response = await api.get<{ data: ActivityFeed[] }>('/social/feed?limit=20', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      setFeed(response.data || []);
      setLikedPosts(
        new Set(response.data?.filter((a) => a.liked).map((a) => a.id) || [])
      );
    } catch (error) {
      toast.error('Failed to load feed');
      console.error('Fetch feed error:', error);
    }
  };

  const fetchFollowers = async () => {
    try {
      const response = await api.get<{ data: UserProfile[] }>('/social/followers?limit=10', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      setFollowers(response.data || []);
      setFollowingUsers(
        new Set(response.data?.filter((u) => u.is_following).map((u) => u.id) || [])
      );
    } catch (error) {
      console.error('Fetch followers error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
    fetchFollowers();
  }, []);

  const handleLike = async (activityId: string) => {
    try {
      const isLiked = likedPosts.has(activityId);
      if (isLiked) {
        await api.delete(`/social/activities/${activityId}/like`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        });
        setLikedPosts((prev) => {
          const next = new Set(prev);
          next.delete(activityId);
          return next;
        });
      } else {
        await api.post(`/social/activities/${activityId}/like`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        });
        setLikedPosts((prev) => new Set(prev).add(activityId));
      }
      // Refetch to update counts
      fetchFeed();
    } catch (error) {
      toast.error('Failed to update like');
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      const isFollowing = followingUsers.has(userId);
      if (isFollowing) {
        await api.delete(`/social/users/${userId}/follow`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        });
        setFollowingUsers((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      } else {
        await api.post(`/social/users/${userId}/follow`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        });
        setFollowingUsers((prev) => new Set(prev).add(userId));
      }
      // Refetch to update counts
      fetchFollowers();
    } catch (error) {
      toast.error('Failed to update follow status');
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'match_created':
        return <Zap className="w-5 h-5 text-blue-400" />;
      case 'match_progressed':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'project_launched':
        return <Users className="w-5 h-5 text-purple-400" />;
      case 'user_followed':
        return <User className="w-5 h-5 text-amber-400" />;
      case 'message_sent':
        return <MessageCircle className="w-5 h-5 text-cyan-400" />;
      default:
        return <Zap className="w-5 h-5 text-slate-400" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'match_created':
        return 'border-l-blue-500 bg-gradient-to-r from-blue-500/10 to-transparent';
      case 'match_progressed':
        return 'border-l-green-500 bg-gradient-to-r from-green-500/10 to-transparent';
      case 'project_launched':
        return 'border-l-purple-500 bg-gradient-to-r from-purple-500/10 to-transparent';
      case 'user_followed':
        return 'border-l-amber-500 bg-gradient-to-r from-amber-500/10 to-transparent';
      case 'message_sent':
        return 'border-l-cyan-500 bg-gradient-to-r from-cyan-500/10 to-transparent';
      default:
        return 'border-l-slate-500 bg-gradient-to-r from-slate-500/10 to-transparent';
    }
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
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Network Feed</h1>
              <p className="text-slate-400">Discover activity from your network</p>
            </div>

            {/* Feed Items */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="h-32 bg-slate-800/30 rounded-lg border border-slate-700/30"
                  />
                ))}
              </div>
            ) : feed.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400 mb-2">No activity yet</p>
                <p className="text-slate-500 text-sm">Follow users to see their activity</p>
              </motion.div>
            ) : (
              <motion.div className="space-y-4">
                {feed.map((activity, idx) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`group p-4 rounded-lg border-l-4 ${getActivityColor(activity.type)} border border-slate-700/30 transition-all hover:shadow-lg hover:shadow-slate-900/50`}
                  >
                    {/* Activity Header */}
                    <div className="flex items-start gap-4 mb-3">
                      <div className="flex-shrink-0 pt-1">{getActivityIcon(activity.type)}</div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-slate-900 font-semibold">
                          <Link href={`/profile/${activity.actor_id}`} className="hover:text-blue-700">
                            {activity.actor_name}
                          </Link>
                        </h3>
                        <p className="text-slate-400 text-sm">{activity.action}</p>
                        {activity.target && (
                          <p className="text-slate-300 text-sm mt-1">
                            <span className="font-medium">{activity.target}</span>
                          </p>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 flex-shrink-0">
                        {new Date(activity.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>

                    {/* Activity Actions */}
                    <div className="flex gap-6 text-slate-400 text-sm">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => handleLike(activity.id)}
                        className={`flex items-center gap-2 transition-colors ${
                          likedPosts.has(activity.id) ? 'text-red-400' : 'hover:text-red-400'
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${likedPosts.has(activity.id) ? 'fill-current' : ''}`}
                        />
                        {activity.likes_count}
                      </motion.button>

                      <div className="flex items-center gap-2 hover:text-blue-400 transition-colors cursor-pointer">
                        <MessageCircle className="w-4 h-4" />
                        {activity.comments_count}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="flex items-center gap-2 hover:text-green-400 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Sidebar - Followers/Suggestions */}
          <div>
            {/* Followers Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-lg border border-slate-700/30 bg-slate-800/20 p-6 sticky top-20"
            >
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Suggested Connections
              </h2>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-slate-700/20 rounded animate-pulse" />
                  ))}
                </div>
              ) : followers.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">No suggestions yet</p>
              ) : (
                <div className="space-y-3">
                  {followers.map((follower) => (
                    <motion.div
                      key={follower.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-700/20 hover:bg-slate-700/30 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/profile/${follower.id}`}
                          className="text-slate-900 font-medium hover:text-blue-700 truncate"
                        >
                          {follower.name}
                        </Link>
                        <p className="text-slate-400 text-xs">
                          {follower.role.charAt(0).toUpperCase() + follower.role.slice(1)}
                        </p>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleFollow(follower.id)}
                        className={`px-3 py-1 rounded text-xs font-semibold transition-colors border ${
                          followingUsers.has(follower.id)
                            ? 'bg-slate-600/30 border-slate-600/50 text-slate-300 hover:bg-slate-600/50'
                            : 'bg-blue-500/20 border-blue-500/30 text-blue-300 hover:bg-blue-500/30'
                        }`}
                      >
                        {followingUsers.has(follower.id) ? 'Following' : 'Follow'}
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
