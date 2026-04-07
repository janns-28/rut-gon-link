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

// ===== UI Atoms =====
const Card = ({ children, className='' }) => (
  <div className={`bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur shadow-lg ${className}`}>
    {children}
  </div>
);

const KPI = ({ label, value, sub }) => (
  <Card>
    <div className="text-xs text-gray-400 mb-1">{label}</div>
    <div className="text-3xl font-bold tracking-tight">{value}</div>
    {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
  </Card>
);

const Badge = ({ children }) => (
  <span className="px-2 py-1 text-xs rounded bg-white/10 border border-white/10">{children}</span>
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
    if (!logs.length) return ['Chưa có dữ liệu'];

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
      <aside className="w-64 border-r border-white/10 p-6 flex flex-col">
        <div className="text-xl font-bold mb-10">Admin</div>
        <button onClick={()=>setTab('links')} className={`text-left mb-2 p-2 rounded ${tab==='links'?'bg-white/10':''}`}>Links</button>
        <button onClick={()=>setTab('stats')} className={`text-left p-2 rounded ${tab==='stats'?'bg-white/10':''}`}>Stats</button>
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

        {/* Main Content Split */}
        <div className="grid grid-cols-3 gap-6">

          {/* LEFT: TABLE */}
          <div className="col-span-2">
            <Card>
              <input
                value={search}
                onChange={e=>setSearch(e.target.value)}
                placeholder="Search..."
                className="mb-4 w-full p-2 bg-black/40 border border-white/10 rounded"
              />

              <table className="w-full text-sm">
                <thead className="text-gray-400 border-b border-white/10">
                  <tr>
                    <th className="text-left py-2">Slug</th>
                    <th className="text-left">URL</th>
                    <th>Network</th>
                    <th>Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(l => (
                    <tr key={l.id} className={`border-b border-white/5 hover:bg-white/5 ${l.clicks===0?'opacity-40':''}`}>
                      <td className="py-2">/{l.slug}</td>
                      <td className="truncate max-w-xs">{l.original_url}</td>
                      <td><Badge>{l.network}</Badge></td>
                      <td className="font-bold text-center">{l.clicks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>

          {/* RIGHT: INSIGHTS */}
          <div>
            <Card>
              <div className="font-semibold mb-3">Insights</div>
              {insights.map((i,idx)=> (
                <div key={idx} className="text-sm text-gray-300 mb-2">{i}</div>
              ))}
            </Card>
          </div>

        </div>

        {/* Stats placeholder */}
        {tab === 'stats' && (
          <Card>
            <div className="text-gray-400">(Chart sẽ làm ở bước tiếp theo)</div>
          </Card>
        )}

      </main>
    </div>
  );
}
