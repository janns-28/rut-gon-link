'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

// ===== Utils =====
const getNetwork = (url = '') => {
  const u = url.toLowerCase();
  if (u.includes('tiktok')) return 'TikTok';
  if (u.includes('facebook')) return 'Facebook';
  if (u.includes('accesstrade')) return 'Accesstrade';
  if (u.includes('masoffer')) return 'MasOffer';
  return 'Other';
};

const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN');

// ===== Components =====
const Card = ({ children }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur">
    {children}
  </div>
);

const KPI = ({ label, value, sub }) => (
  <Card>
    <div className="text-xs text-gray-400 mb-1">{label}</div>
    <div className="text-2xl font-bold text-white">{value}</div>
    {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
  </Card>
);

// ===== Main =====
export default function AdminPro() {
  const [links, setLinks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('links');

  useEffect(() => {
    const load = async () => {
      const [l, c] = await Promise.all([
        supabase.from('links').select('*'),
        supabase.from('click_logs').select('*')
      ]);
      setLinks(l.data || []);
      setLogs(c.data || []);
    };
    load();
  }, []);

  // ===== Data =====
  const clickMap = useMemo(() => {
    const map = {};
    logs.forEach(l => {
      map[l.slug] = (map[l.slug] || 0) + 1;
    });
    return map;
  }, [logs]);

  const enrichedLinks = useMemo(() => {
    return links.map(l => ({
      ...l,
      clicks: clickMap[l.slug] || 0,
      network: getNetwork(l.original_url)
    }));
  }, [links, clickMap]);

  const filtered = enrichedLinks.filter(l =>
    l.slug.toLowerCase().includes(search.toLowerCase()) ||
    l.original_url.toLowerCase().includes(search.toLowerCase())
  );

  const topLink = [...enrichedLinks].sort((a,b)=>b.clicks-a.clicks)[0];

  const insights = useMemo(() => {
    if (!logs.length) return [];

    const res = [];

    if (topLink && topLink.clicks / logs.length > 0.4) {
      res.push(`⚠️ Link /${topLink.slug} chiếm phần lớn traffic`);
    }

    const zero = enrichedLinks.filter(l => l.clicks === 0);
    if (zero.length) {
      res.push(`💀 ${zero.length} link chưa có click`);
    }

    return res;
  }, [logs, enrichedLinks, topLink]);

  // ===== UI =====
  return (
    <div className="min-h-screen bg-[#0b0f14] text-white flex">

      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 p-6">
        <div className="text-xl font-bold mb-10">Dashboard</div>
        <button onClick={()=>setTab('links')} className="block mb-2">Links</button>
        <button onClick={()=>setTab('stats')}>Stats</button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 space-y-6">

        {/* KPI */}
        <div className="grid grid-cols-4 gap-4">
          <KPI label="Total Links" value={links.length} />
          <KPI label="Total Clicks" value={logs.length} />
          <KPI label="Top Link" value={topLink ? `/${topLink.slug}` : '-'} />
          <KPI label="Top Clicks" value={topLink?.clicks || 0} />
        </div>

        {/* Insight */}
        <Card>
          <div className="font-semibold mb-2">Insights</div>
          {insights.length === 0 ? (
            <div className="text-gray-400">No insight yet</div>
          ) : insights.map((i,idx)=> (
            <div key={idx} className="text-sm text-gray-300">{i}</div>
          ))}
        </Card>

        {tab === 'links' && (
          <Card>
            <input
              value={search}
              onChange={e=>setSearch(e.target.value)}
              placeholder="Search..."
              className="mb-4 w-full p-2 bg-black/40 border border-white/10 rounded"
            />

            <table className="w-full text-sm">
              <thead className="text-gray-400">
                <tr>
                  <th>Slug</th>
                  <th>URL</th>
                  <th>Network</th>
                  <th>Clicks</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id} className={l.clicks === 0 ? 'opacity-40' : ''}>
                    <td>/{l.slug}</td>
                    <td className="truncate max-w-xs">{l.original_url}</td>
                    <td>{l.network}</td>
                    <td className="font-bold">{l.clicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {tab === 'stats' && (
          <Card>
            <div className="text-gray-400">(Chart sẽ gắn vào đây sau)</div>
          </Card>
        )}

      </main>
    </div>
  );
}
