import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../components/hooks/useAuth'
import { Users, Search, Calendar, TrendingUp, Mail, LogOut } from 'lucide-react'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    
    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (profiles) setUsers(profiles)

    // Get user sessions
    const { data: userSessions, error: sessionsError } = await supabase
      .from('user_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (userSessions) setSessions(userSessions)

    // Calculate stats
    if (profiles && userSessions) {
      setStats({
        totalUsers: profiles.length,
        newToday: profiles.filter(p => 
          new Date(p.created_at).toDateString() === new Date().toDateString()
        ).length,
        activeSessions: userSessions.filter(s => s.is_logged_in).length,
        googleUsers: profiles.filter(p => p.provider === 'google').length,
        emailUsers: profiles.filter(p => p.provider === 'email').length,
        totalSearches: profiles.reduce((sum, p) => sum + (p.search_count || 0), 0)
      })
    }

    setLoading(false)
  }

  // Check if current user is admin (you can set this in profiles table)
  const isAdmin = user?.email === 'your-email@example.com' // Change this

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600">You don't have permission to view this page.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Refresh Data
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-indigo-500" />
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                +{stats.newToday} today
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
            <p className="text-sm text-slate-600">Total Users</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <LogOut className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.activeSessions}</p>
            <p className="text-sm text-slate-600">Active Sessions</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalSearches}</p>
            <p className="text-sm text-slate-600">Total Searches</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-5 h-5 text-amber-500" />
              <Chrome className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.googleUsers} / {stats.emailUsers}</p>
            <p className="text-sm text-slate-600">Google / Email Users</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="font-semibold text-slate-900">Recent Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Searches</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.full_name} className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-indigo-600" />
                          </div>
                        )}
                        <span className="font-medium text-slate-900">{user.full_name || 'No name'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.provider === 'google' 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {user.provider}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{user.search_count || 0}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="font-semibold text-slate-900">Recent Sessions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Session ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">User ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">{session.id.slice(0, 8)}...</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">{session.user_id?.slice(0, 8)}...</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        session.is_logged_in 
                          ? 'bg-green-50 text-green-600' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {session.is_logged_in ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(session.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}