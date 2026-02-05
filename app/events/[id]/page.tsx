'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { supabase, Event, Dashboard } from '@/lib/supabase';

export default function EventDashboardsPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    setLoading(true);

    // 이벤트 정보 가져오기
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError) {
      console.error('Error fetching event:', eventError);
    } else {
      setEvent(eventData);
    }

    // 대시보드 목록 가져오기
    const { data: dashboardData, error: dashboardError } = await supabase
      .from('dashboards')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (dashboardError) {
      console.error('Error fetching dashboards:', dashboardError);
    } else {
      setDashboards(dashboardData || []);
    }

    setLoading(false);
  };

  const deleteDashboard = async (dashboardId: string) => {
    if (!confirm('이 대시보드를 삭제하시겠습니까?')) return;

    const { error } = await supabase
      .from('dashboards')
      .delete()
      .eq('id', dashboardId);

    if (error) {
      console.error('Error deleting dashboard:', error);
      alert('삭제 중 오류가 발생했습니다.');
    } else {
      setDashboards(dashboards.filter(d => d.id !== dashboardId));
    }
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

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const getDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">로딩중...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">이벤트를 찾을 수 없습니다</p>
          <Link href="/events">
            <Button>이벤트 목록으로</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">
              <Link href="/events" className="hover:underline">
                이벤트 관리
              </Link>
              {' > '}{event.name}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm text-gray-500">
                {formatDate(event.start_date)} ~ {formatDate(event.end_date)} ({getDuration(event.start_date, event.end_date)}일)
              </span>
              <Badge className={event.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}>
                {event.status === 'active' ? '진행중' : '종료'}
              </Badge>
            </div>
          </div>
          <Link href={`/events/${eventId}/upload`}>
            <Button>+ 새 데이터 업로드</Button>
          </Link>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* 저장된 대시보드 목록 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">저장된 대시보드</CardTitle>
            <CardDescription>업로드하고 저장한 대시보드 목록입니다</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboards.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead>데이터 기간</TableHead>
                    <TableHead className="text-right">매출</TableHead>
                    <TableHead className="text-right">선물 수</TableHead>
                    <TableHead className="text-right">크리에이터</TableHead>
                    <TableHead>저장일시</TableHead>
                    <TableHead className="text-right">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboards.map((dashboard) => (
                    <TableRow key={dashboard.id}>
                      <TableCell className="font-medium">{dashboard.name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {dashboard.dashboard_type === 'monitoring' ? '모니터링' : '성과분석'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(dashboard.data_start_date)} ~ {formatDate(dashboard.data_end_date)}
                        <span className="text-gray-400 text-xs ml-1">
                          ({getDuration(dashboard.data_start_date, dashboard.data_end_date)}일)
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatRevenue(dashboard.summary.totalRevenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        {dashboard.summary.totalGiftCount.toLocaleString()}개
                      </TableCell>
                      <TableCell className="text-right">
                        {dashboard.summary.creatorCount}명
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        {formatDateTime(dashboard.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Link href={`/events/${eventId}/dashboard/${dashboard.id}`}>
                            <Button variant="outline" size="sm">
                              보기
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => deleteDashboard(dashboard.id)}
                          >
                            삭제
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p className="mb-4">저장된 대시보드가 없습니다</p>
                <Link href={`/events/${eventId}/upload`}>
                  <Button>+ 새 데이터 업로드</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
