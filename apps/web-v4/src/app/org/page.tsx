'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import {
  Users,
  Plus,
  Mail,
  Trash2,
  Shield,
  UserCheck,
  Send,
  Copy,
  Check,
} from 'lucide-react';

interface OrgMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'invited' | 'pending';
  joined_at: string;
}

interface OrgInfo {
  id: string;
  name: string;
  members_count: number;
  created_at: string;
}

/** GET /org/members trả { members: OrgMember[] } từ API — không phải mảng thô */
function normalizeMembersList(raw: unknown): OrgMember[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((m) => mapApiMemberRow(m));
  }
  if (typeof raw === 'object' && raw !== null && 'members' in raw) {
    const list = (raw as { members: unknown }).members;
    if (!Array.isArray(list)) return [];
    return list.map((m) => mapApiMemberRow(m));
  }
  return [];
}

function mapApiMemberRow(m: unknown): OrgMember {
  const row = m as {
    id?: string;
    user_id?: string;
    full_name?: string;
    email?: string;
    name?: string;
    role_code?: string;
    role?: string;
    joined_at?: string;
  };
  const id = row.user_id ?? row.id ?? '';
  const roleRaw = (row.role_code ?? row.role ?? 'member').toLowerCase();
  const role: OrgMember['role'] =
    roleRaw === 'owner'
      ? 'owner'
      : roleRaw === 'admin' || roleRaw === 'assessor'
        ? 'admin'
        : 'member';
  return {
    id,
    name: row.full_name ?? row.name ?? row.email ?? 'Member',
    email: row.email ?? '',
    role,
    status: 'active',
    joined_at: row.joined_at ?? new Date().toISOString(),
  };
}

export default function OrgManagementPage() {
  const { user } = useAuth();
  const [orgInfo, setOrgInfo] = useState<OrgInfo | null>(null);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [inviting, setInviting] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);

  const fetchOrgData = async () => {
    try {
      setLoading(true);
      let nextMembers: OrgMember[] = [];
      try {
        const membersRes = await api.get<unknown>('/org/members');
        nextMembers = normalizeMembersList(membersRes);
        setMembers(nextMembers);
      } catch {
        setMembers([]);
        nextMembers = [];
      }

      try {
        const profile = await api.get<{
          org: { id: string; name: string; created_at: string };
        }>('/org/profile');
        const org = profile.org;
        setOrgInfo({
          id: org.id,
          name: org.name,
          members_count: nextMembers.length,
          created_at: org.created_at,
        });
      } catch {
        setOrgInfo(null);
      }
    } catch (error) {
      toast.error('Failed to load organization data');
      console.error('Fetch org error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgData();
  }, []);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteEmail) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      setInviting(true);
      const response = await api.post<{ invite_url?: string }>('/org/invites', {
        email: inviteEmail,
        role_code: inviteRole === 'admin' ? 'assessor' : 'member',
      });

      setInviteLink(response.invite_url || '');
      setInviteEmail('');
      toast.success('Invitation sent successfully');
      fetchOrgData();
    } catch (error) {
      toast.error('Failed to send invitation');
      console.error('Invite error:', error);
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      await api.delete(`/org/members/${memberId}`);
      toast.success('Member removed');
      fetchOrgData();
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  const handleChangeRole = async (memberId: string, newRole: 'admin' | 'member') => {
    try {
      await api.patch('/org/members/role', {
        user_id: memberId,
        role_code: newRole,
      });
      toast.success('Role updated');
      fetchOrgData();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setInviteLinkCopied(true);
    setTimeout(() => setInviteLinkCopied(false), 2000);
    toast.success('Invite link copied!');
  };

  const isOwner =
    Array.isArray(members) &&
    members.some((m) => m.id === user?.id && m.role === 'owner');

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-20 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-3xl md:text-4xl font-bold text-slate-900 mb-2"
              id="page-org-heading"
            >
              Organization
            </h1>
            <p className="text-slate-400">
              {orgInfo?.name || 'Your Organization'} · {orgInfo?.members_count || 0} members
            </p>
          </div>

          {isOwner && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-medium border border-blue-500/30 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Invite Member
            </motion.button>
          )}
        </div>

        {/* Members Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, repeat: Infinity }}
                className="h-24 bg-slate-800/30 rounded-lg border border-slate-700/30"
              />
            ))}
          </div>
        ) : members.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 rounded-lg border border-slate-700/30 bg-slate-800/10"
          >
            <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">No members yet</p>
            <p className="text-slate-500 text-sm">Start by inviting team members</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member, idx) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 rounded-lg border border-slate-700/30 bg-slate-800/20 hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-slate-900 font-semibold">{member.name}</h3>
                    <p className="text-slate-400 text-sm">{member.email}</p>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border ${
                      member.status === 'active'
                        ? 'bg-green-500/20 text-green-300 border-green-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {member.status === 'active' ? (
                      <>
                        <UserCheck className="w-3 h-3" />
                        Active
                      </>
                    ) : (
                      <>
                        <Mail className="w-3 h-3" />
                        Invited
                      </>
                    )}
                  </span>
                </div>

                {/* Member Info */}
                <div className="mb-3 text-sm">
                  <p className="text-slate-400">
                    Joined{' '}
                    {new Date(member.joined_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: new Date(member.joined_at).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
                    })}
                  </p>
                </div>

                {/* Actions */}
                {isOwner && member.id !== user?.id && (
                  <div className="flex gap-2">
                    {member.role !== 'owner' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() =>
                          handleChangeRole(
                            member.id,
                            member.role === 'admin' ? 'member' : 'admin'
                          )
                        }
                        className="flex-1 px-2 py-1 text-xs font-medium rounded bg-slate-700/30 hover:bg-slate-700/50 text-slate-300 transition-colors flex items-center gap-1 justify-center"
                      >
                        <Shield className="w-3 h-3" />
                        {member.role === 'admin' ? 'Demote' : 'Promote'}
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleRemoveMember(member.id)}
                      className="flex-1 px-2 py-1 text-xs font-medium rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors flex items-center gap-1 justify-center"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </motion.button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowInviteModal(false)}
          className="fixed inset-0 bg-slate-900/10 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white/90 border border-slate-200/80 rounded-lg p-6 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" />
              Invite Team Member
            </h2>

            <form onSubmit={handleInviteMember} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="member@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/80 border border-slate-200 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              {/* Role Select */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                  className="w-full px-3 py-2 rounded-lg bg-white/80 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500/50 transition-colors"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Invite Link Display */}
              {inviteLink && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-green-500/10 border border-green-500/30"
                >
                  <p className="text-sm text-green-300 font-medium mb-2">Share this link:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={inviteLink}
                      className="flex-1 px-2 py-1 text-xs rounded bg-slate-900/50 border border-slate-600/50 text-slate-300 overflow-x-auto"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      type="button"
                      onClick={copyInviteLink}
                      className="px-2 py-1 rounded bg-green-500/20 hover:bg-green-500/30 text-green-300 transition-colors"
                    >
                      {inviteLinkCopied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 text-slate-300 font-medium transition-colors"
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={inviting}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-medium border border-blue-500/30 transition-colors disabled:opacity-50 flex items-center gap-2 justify-center"
                >
                  {inviting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-blue-300 border-t-transparent animate-spin" />
                      Inviting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Invite
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
