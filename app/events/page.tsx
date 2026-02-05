'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
import { supabase, Event } from '@/lib/supabase';

type FilterStatus = 'all' | 'active' | 'ended';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching events:', error);
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('이 이벤트를 삭제하시겠습니까?\n(연결된 대시보드도 모두 삭제됩니다)')) return;

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('Error deleting event:', error);
      alert('삭제 중 오류가 발생했습니다.');
    } else {
      setEvents(events.filter(e => e.id !== eventId));
    }
  };

  const filteredEvents = events.filter((event) => {
    if (filterStatus === 'all') return true;
    return event.status === filterStatus;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const getDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${diff}일`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">이벤트 관리</h1>
            <p className="text-sm text-gray-500 mt-1">선물 이벤트를 등록하고 관리합니다</p>
          </div>
          <Link href="/events/new">
            <Button>+ 새 이벤트 등록</Button>
          </Link>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">전체 이벤트</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}개</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">진행중</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {events.filter((e) => e.status === 'active').length}개
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">종료됨</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-400">
                {events.filter((e) => e.status === 'ended').length}개
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 필터 */}
        <div className="flex gap-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            전체
          </Button>
          <Button
            variant={filterStatus === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('active')}
          >
            진행중
          </Button>
          <Button
            variant={filterStatus === 'ended' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('ended')}
          >
            종료됨
          </Button>
        </div>

        {/* 이벤트 목록 */}
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-12 text-gray-400">
                로딩중...
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>이벤트명</TableHead>
                      <TableHead>기간</TableHead>
                      <TableHead>국가</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead className="text-right">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{event.name}</div>
                            <div className="text-xs text-gray-400">{event.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(event.start_date)} ~ {formatDate(event.end_date)}
                          </div>
                          <div className="text-xs text-gray-400">{getDuration(event.start_date, event.end_date)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {event.target_countries.map((country) => (
                              <Badge key={country} variant="outline" className="text-xs">
                                {country}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              event.status === 'active'
                                ? 'bg-green-500'
                                : 'bg-gray-400'
                            }
                          >
                            {event.status === 'active' ? '진행중' : '종료'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Link href={`/events/${event.id}`}>
                              <Button variant="outline" size="sm">
                                대시보드
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => deleteEvent(event.id)}
                            >
                              삭제
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredEvents.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <p>등록된 이벤트가 없습니다</p>
                    <Link href="/events/new">
                      <Button className="mt-4">+ 새 이벤트 등록</Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
