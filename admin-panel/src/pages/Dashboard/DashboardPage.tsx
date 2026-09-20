import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { fetchDashboardStats } from '@/store/slices/dashboardSlice';
import { StatCard } from '@/components/ui/StatCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { FileText, Clock, Users, Star, RefreshCw } from 'lucide-react';
import { SubmissionsChart } from './components/SubmissionsChart';
import { RecentSubmissionsTable } from './components/RecentSubmissionsTable';
import { NeedsAttentionPanel } from './components/NeedsAttentionPanel';

const REFRESH_INTERVAL_MS = 60_000;

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stats, loading } = useSelector((state: RootState) => state.dashboard);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [chartHeight, setChartHeight] = useState(200);

  useEffect(() => {
    let cancelled = false;
    const load = () => dispatch(fetchDashboardStats()).then(() => {
      if (!cancelled) setLastUpdated(Date.now());
    });
    load();

    const timer = setInterval(load, REFRESH_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(timer); };
  }, [dispatch]);

  useEffect(() => {
    const updateChartHeight = () => {
      if (typeof window === 'undefined') return;
      setChartHeight(window.innerWidth < 480 ? 140 : window.innerWidth < 768 ? 160 : 200);
    };
    updateChartHeight();
    window.addEventListener('resize', updateChartHeight);
    return () => window.removeEventListener('resize', updateChartHeight);
  }, []);

  useEffect(() => {
    if (!lastUpdated) return;
    setSecondsAgo(0);
    const timer = setInterval(() => {
      setSecondsAgo(s => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!stats) {
    return (
      <EmptyState
        title="No dashboard data available"
        description="There is no data to display yet."
      />
    );
  }

  const totalSubmissions = stats.submissionsLast30Days?.reduce(
    (acc: number, curr: { count: number }) => acc + curr.count, 0
  ) ?? 0;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="flex flex-col gap-6">
      {/* Header with live indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted">
          <RefreshCw size={14} className="text-green-600" />
          <span>Live · Updated {secondsAgo === 0 ? 'just now' : `${secondsAgo}s ago`}</span>
        </div>
      </div>

      {/* Stat cards — responsive: 4 cols on desktop, 2 on tablet, 1 on phone */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Published News" value={stats.publishedNewsCount} icon={FileText} change={stats.metricsChange?.publishedNews ?? undefined} trendUp={(stats.metricsChange?.publishedNews ?? 0) >= 0} iconBg="bg-green-50" iconColor="text-green-600" />
        <StatCard title="Pending Review" value={stats.pendingCount + (stats.underReviewCount ?? 0)} icon={Clock} change={stats.metricsChange?.submissions ?? undefined} trendUp={(stats.metricsChange?.submissions ?? 0) >= 0} iconBg="bg-yellow-50" iconColor="text-yellow-600" />
        <StatCard title="Contributors" value={stats.totalContributors} icon={Users} change={stats.metricsChange?.contributors ?? undefined} trendUp={(stats.metricsChange?.contributors ?? 0) >= 0} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="Credits Awarded" value={stats.totalCreditsAwarded} icon={Star} change={undefined} trendUp={true} iconBg="bg-purple-50" iconColor="text-purple-600" />
      </div>

      {/* Body grid — on mobile, chart goes above the recent submissions */}
      <div className="grid gap-5" style={{ gridTemplateColumns: isMobile ? '1fr' : '3fr 2fr' }}>
        {/* Chart column — first on mobile */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col order-first md:order-none">
          <h2 className="font-semibold text-gray-900 mb-5">Submissions (30 Days)</h2>
          <SubmissionsChart data={stats.submissionsLast30Days ?? []} chartHeight={chartHeight} />
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              { label: 'Total',    value: totalSubmissions },
              { label: 'This Month', value: stats.currentMonthSubmissions ?? 0 },
              { label: 'Daily Avg', value: (totalSubmissions / 30).toFixed(1) },
            ].map(({ label, value }) => (
              <div key={label} className="text-center p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-muted mb-1">{label}</p>
                <p className="text-lg font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Left column */}
        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900">Recent Submissions</h2>
              <a href="/submissions" className="text-sm text-primary font-medium hover:underline">View all</a>
            </div>
            {stats.recentSubmissions && stats.recentSubmissions.length > 0 ? (
              <RecentSubmissionsTable items={stats.recentSubmissions} />
            ) : (
              <EmptyState title="No submissions yet" description="There are no pending or under-review submissions at the moment." />
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-5">Needs Your Attention</h2>
            <NeedsAttentionPanel data={stats.needsAttentionData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;