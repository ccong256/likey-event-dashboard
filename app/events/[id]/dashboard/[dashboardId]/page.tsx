'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { supabase, Event, Dashboard } from '@/lib/supabase';
import AskAI from '@/components/AskAI';

const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'];

export default function DashboardViewPage() {
  const params = useParams();
  const eventId = params.id as string;
  const dashboardId = params.dashboardId as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [topN, setTopN] = useState<5 | 10>(5);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, [eventId, dashboardId]);

  const fetchData = async () => {
    setLoading(true);

    const { data: eventData } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventData) setEvent(eventData);

    const { data: dashboardData } = await supabase
      .from('dashboards')
      .select('*')
      .eq('id', dashboardId)
      .single();

    if (dashboardData) setDashboard(dashboardData);

    setLoading(false);
  };

  const formatRevenue = (value: number) => {
    if (value >= 100000000) {
      return `${(value / 100000000).toFixed(1)}억원`;
    } else if (value >= 10000) {
      return `${(value / 10000).toFixed(0)}만원`;
    }
    return `${value.toLocaleString()}원`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">로딩중...</p>
      </div>
    );
  }

  if (!dashboard || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">대시보드를 찾을 수 없습니다</p>
          <Link href="/events">
            <Button>이벤트 목록으로</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { summary, ranking } = dashboard;
  const isAnalysis = dashboard.dashboard_type === 'analysis';
  const beforeSummary = dashboard.before_summary;

  // 차트 데이터
  const topChartData = ranking.slice(0, topN).map(d => ({
    name: d.nickname.length > 8 ? d.nickname.slice(0, 8) + '...' : d.nickname,
    매출: d.revenue,
  }));

  // 페이지네이션
  const totalPages = Math.ceil(ranking.length / itemsPerPage);
  const paginatedData = ranking.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 증감률 계산
  const getGrowth = (current: number, before: number) => {
    if (!before) return null;
    return ((current - before) / before * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">
              <Link href="/events" className="hover:underline">이벤트 관리</Link>
              {' > '}
              <Link href={`/events/${eventId}`} className="hover:underline">{event.name}</Link>
              {' > '}{dashboard.name || '대시보드'}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{dashboard.name || '대시보드'}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm text-gray-500">
                데이터: {formatDate(dashboard.data_start_date)} ~ {formatDate(dashboard.data_end_date)}
              </span>
              <Badge variant="outline">
                {isAnalysis ? '성과분석' : '모니터링'}
              </Badge>
            </div>
          </div>
          <Link href={`/events/${eventId}`}>
            <Button variant="outline">목록으로</Button>
          </Link>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">총 매출</CardTitle>
              {isAnalysis && beforeSummary && (
                <span className={`text-xs font-medium ${Number(getGrowth(summary.totalRevenue, beforeSummary.totalRevenue)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Number(getGrowth(summary.totalRevenue, beforeSummary.totalRevenue)) >= 0 ? '↑' : '↓'} {getGrowth(summary.totalRevenue, beforeSummary.totalRevenue)}%
                </span>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatRevenue(summary.totalRevenue)}</div>
              {isAnalysis && beforeSummary && (
                <p className="text-xs text-gray-400 mt-1">직전: {formatRevenue(beforeSummary.totalRevenue)}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">선물 수량</CardTitle>
              {isAnalysis && beforeSummary && (
                <span className={`text-xs font-medium ${Number(getGrowth(summary.totalGiftCount, beforeSummary.totalGiftCount)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Number(getGrowth(summary.totalGiftCount, beforeSummary.totalGiftCount)) >= 0 ? '↑' : '↓'} {getGrowth(summary.totalGiftCount, beforeSummary.totalGiftCount)}%
                </span>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalGiftCount.toLocaleString()}개</div>
              {isAnalysis && beforeSummary && (
                <p className="text-xs text-gray-400 mt-1">직전: {beforeSummary.totalGiftCount.toLocaleString()}개</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">참여 유저 수</CardTitle>
              {isAnalysis && beforeSummary && (
                <span className={`text-xs font-medium ${Number(getGrowth(summary.totalSenderCount, beforeSummary.totalSenderCount)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Number(getGrowth(summary.totalSenderCount, beforeSummary.totalSenderCount)) >= 0 ? '↑' : '↓'} {getGrowth(summary.totalSenderCount, beforeSummary.totalSenderCount)}%
                </span>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalSenderCount.toLocaleString()}명</div>
              {isAnalysis && beforeSummary && (
                <p className="text-xs text-gray-400 mt-1">직전: {beforeSummary.totalSenderCount.toLocaleString()}명</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">크리에이터</CardTitle>
              {isAnalysis && beforeSummary && (
                <span className={`text-xs font-medium ${Number(getGrowth(summary.creatorCount, beforeSummary.creatorCount)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Number(getGrowth(summary.creatorCount, beforeSummary.creatorCount)) >= 0 ? '↑' : '↓'} {getGrowth(summary.creatorCount, beforeSummary.creatorCount)}%
                </span>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.creatorCount}명</div>
              {isAnalysis && beforeSummary && (
                <p className="text-xs text-gray-400 mt-1">직전: {beforeSummary.creatorCount}명</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">TOP {topN} 크리에이터 매출</CardTitle>
              <div className="flex gap-1">
                <Button variant={topN === 5 ? 'default' : 'outline'} size="sm" onClick={() => setTopN(5)}>TOP 5</Button>
                <Button variant={topN === 10 ? 'default' : 'outline'} size="sm" onClick={() => setTopN(10)}>TOP 10</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className={topN === 5 ? 'h-[300px]' : 'h-[450px]'}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => `${(v/10000).toFixed(0)}만`} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => [formatRevenue(Number(value)), '매출']} />
                    <Bar dataKey="매출" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">TOP {topN} 매출 점유율</CardTitle>
              <div className="flex gap-1">
                <Button variant={topN === 5 ? 'default' : 'outline'} size="sm" onClick={() => setTopN(5)}>TOP 5</Button>
                <Button variant={topN === 10 ? 'default' : 'outline'} size="sm" onClick={() => setTopN(10)}>TOP 10</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className={topN === 5 ? 'h-[300px]' : 'h-[450px]'}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ranking.slice(0, topN).map(d => ({ name: d.nickname, value: d.revenue }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={topN === 5 ? 60 : 80}
                      outerRadius={topN === 5 ? 100 : 140}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${(name || '').slice(0, 5)}.. ${((percent || 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {ranking.slice(0, topN).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatRevenue(Number(value)), '매출']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI 질문 */}
        <AskAI rankingData={ranking} summary={summary} />

        {/* Ranking Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">크리에이터 랭킹</CardTitle>
            <span className="text-sm text-gray-500">총 {ranking.length}명</span>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">순위</TableHead>
                  <TableHead>크리에이터</TableHead>
                  <TableHead className="text-right">골드</TableHead>
                  <TableHead className="text-right">매출</TableHead>
                  <TableHead className="text-right">선물 수량</TableHead>
                  <TableHead className="text-right">참여 유저</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((creator) => (
                  <TableRow key={creator.uid}>
                    <TableCell>
                      {creator.rank <= 3 ? (
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-sm font-bold ${
                          creator.rank === 1 ? 'bg-yellow-500' :
                          creator.rank === 2 ? 'bg-gray-400' :
                          'bg-amber-600'
                        }`}>
                          {creator.rank}
                        </span>
                      ) : (
                        <span className="text-gray-500">{creator.rank}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{creator.nickname}</div>
                        <div className="text-xs text-gray-400">@{creator.username}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-gray-500">
                      {creator.gold.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatRevenue(creator.revenue)}
                    </TableCell>
                    <TableCell className="text-right">
                      {creator.giftCount.toLocaleString()}개
                    </TableCell>
                    <TableCell className="text-right">
                      {creator.senderCount}명
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <span className="text-sm text-gray-500">
                  {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, ranking.length)} / {ranking.length}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    이전
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    다음
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
