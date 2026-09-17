import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { fetchDashboardStats } from '@/store/slices/dashboardSlice';
import { StatCard } from '@/components/ui/StatCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FileText, Clock, Users, Star } from 'lucide-react';
import { SubmissionsChart } from './components/SubmissionsChart';
import { RecentSubmissionsTable } from './components/RecentSubmissionsTable';
import { NeedsAttentionPanel } from './components/NeedsAttentionPanel';

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stats, loading } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center text-muted py-20">No dashboard data available.</div>;
  }

  const totalSubmissions = stats.submissionsLast30Days?.reduce(
    (acc: number, curr: { count: number }) => acc + curr.count, 0
  ) ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-5">
        <StatCard title="Published News" value={stats.publishedNewsCount} icon={FileText} change={stats.metricsChange?.publishedNews ?? undefined} trendUp={(stats.metricsChange?.publishedNews ?? 0) >= 0} iconBg="bg-green-50" iconColor="text-green-600" />
        <StatCard title="Pending Review" value={stats.pendingCount + (stats.underReviewCount ?? 0)} icon={Clock} change={undefined} trendUp={false} iconBg="bg-yellow-50" iconColor="text-yellow-600" />
        <StatCard title="Contributors" value={stats.totalContributors} icon={Users} change={undefined} trendUp={true} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="Credits Awarded" value={stats.totalCreditsAwarded} icon={Star} change={undefined} trendUp={true} iconBg="bg-purple-50" iconColor="text-purple-600" />
      </div>

      {/* Body grid */}
      <div className="grid gap-5" style={{ gridTemplateColumns: '3fr 2fr' }}>
        {/* Left column */}
        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900">Recent Submissions</h2>
              <a href="/submissions" className="text-sm text-primary font-medium hover:underline">View all</a>
            </div>
            <RecentSubmissionsTable items={stats.recentSubmissions ?? []} />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-5">Needs Your Attention</h2>
            <NeedsAttentionPanel data={stats.needsAttentionData} />
          </div>
        </div>

        {/* Right column — chart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <h2 className="font-semibold text-gray-900 mb-5">Submissions (30 Days)</h2>
          <SubmissionsChart data={stats.submissionsLast30Days ?? []} />
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
      </div>
    </div>
  );
};

export default DashboardPage;