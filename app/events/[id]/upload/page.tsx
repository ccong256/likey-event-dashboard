'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
import Papa from 'papaparse';
import { supabase, Event } from '@/lib/supabase';

interface GiftData {
  uid: string;
  nickname: string;
  username: string;
  country: string;
  gold: number;
  giftCount: number;
  senderCount: number;
  senderUids: string[];
}

interface UploadState {
  file: File | null;
  data: GiftData[];
  isLoading: boolean;
  error: string | null;
}

const initialUploadState: UploadState = {
  file: null,
  data: [],
  isLoading: false,
  error: null,
};

type ViewMode = 'monitoring' | 'analysis';

export default function UploadPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('monitoring');
  const [eventPeriod, setEventPeriod] = useState<UploadState>(initialUploadState);
  const [beforePeriod, setBeforePeriod] = useState<UploadState>(initialUploadState);
  const [activeTab, setActiveTab] = useState<'event' | 'before'>('event');
  const [dataStartDate, setDataStartDate] = useState('');
  const [dataEndDate, setDataEndDate] = useState('');

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) {
      console.error('Error fetching event:', error);
    } else {
      setEvent(data);
      setDataStartDate(data.start_date);
      setDataEndDate(data.end_date);
    }
  };

  const parseCSV = useCallback((file: File, setState: React.Dispatch<React.SetStateAction<UploadState>>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedData: GiftData[] = (results.data as Record<string, string>[]).map((row) => {
            // CSV 컬럼명 매핑 (실제 CSV 구조에 맞게 조정)
            const gold = parseInt(row['골드 수량'] || row['gold'] || row['Gold'] || '0', 10);
            const giftCount = parseInt(row['선물 수량'] || row['giftCount'] || row['Gift Count'] || '0', 10);
            const senderCount = parseInt(row['선물을 보낸 유저 수'] || row['senderCount'] || row['Sender Count'] || '0', 10);

            return {
              uid: row['Uid'] || row['uid'] || row['UID'] || '',
              nickname: row['NickName'] || row['nickname'] || row['Nickname'] || '',
              username: row['username'] || row['Username'] || '',
              country: row['country'] || row['Country'] || 'KR',
              gold: isNaN(gold) ? 0 : gold,
              giftCount: isNaN(giftCount) ? 0 : giftCount,
              senderCount: isNaN(senderCount) ? 0 : senderCount,
              senderUids: (row['선물 보낸 유저들 정보'] || row['senderUids'] || '').split(',').filter(Boolean),
            };
          }).filter(item => item.uid); // uid가 있는 행만 필터링

          setState({
            file,
            data: parsedData,
            isLoading: false,
            error: null,
          });
        } catch {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'CSV 파싱 중 오류가 발생했습니다.',
          }));
        }
      },
      error: (error) => {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: `파일 읽기 오류: ${error.message}`,
        }));
      },
    });
  }, []);

  const handleDrop = useCallback((
    e: React.DragEvent<HTMLDivElement>,
    setState: React.Dispatch<React.SetStateAction<UploadState>>
  ) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      parseCSV(file, setState);
    } else {
      setState(prev => ({ ...prev, error: 'CSV 파일만 업로드 가능합니다.' }));
    }
  }, [parseCSV]);

  const handleFileSelect = useCallback((
    e: React.ChangeEvent<HTMLInputElement>,
    setState: React.Dispatch<React.SetStateAction<UploadState>>
  ) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      parseCSV(file, setState);
    } else if (file) {
      setState(prev => ({ ...prev, error: 'CSV 파일만 업로드 가능합니다.' }));
    }
  }, [parseCSV]);

  const handleReset = (setState: React.Dispatch<React.SetStateAction<UploadState>>) => {
    setState(initialUploadState);
  };

  const calculateStats = (data: GiftData[]) => {
    const totalGold = data.reduce((sum, item) => sum + item.gold, 0);
    const totalGiftCount = data.reduce((sum, item) => sum + item.giftCount, 0);
    const totalSenderCount = new Set(data.flatMap(item => item.senderUids)).size ||
      data.reduce((sum, item) => sum + item.senderCount, 0);
    return {
      creatorCount: data.length,
      totalGold,
      totalRevenue: totalGold * 100,
      totalGiftCount,
      totalSenderCount,
    };
  };

  const formatRevenue = (value: number) => {
    if (value >= 100000000) {
      return `${(value / 100000000).toFixed(1)}억원`;
    } else if (value >= 10000) {
      return `${(value / 10000).toFixed(0)}만원`;
    }
    return `${value.toLocaleString()}원`;
  };

  const UploadArea = ({
    state,
    setState,
    title,
    description,
  }: {
    state: UploadState;
    setState: React.Dispatch<React.SetStateAction<UploadState>>;
    title: string;
    description: string;
  }) => (
    <Card className={state.data.length > 0 ? 'border-green-500' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {state.data.length > 0 && (
            <Badge className="bg-green-500">업로드 완료</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {state.data.length === 0 ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              state.isLoading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
            onDrop={(e) => handleDrop(e, setState)}
            onDragOver={(e) => e.preventDefault()}
          >
            {state.isLoading ? (
              <div className="text-blue-600">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mb-2" />
                <p>파일 처리 중...</p>
              </div>
            ) : (
              <>
                <div className="text-4xl mb-4">📁</div>
                <p className="text-gray-600 mb-2">CSV 파일을 드래그하여 놓거나</p>
                <label className="cursor-pointer">
                  <span className="text-blue-600 hover:underline">파일 선택</span>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, setState)}
                  />
                </label>
              </>
            )}
            {state.error && (
              <p className="text-red-500 mt-4">{state.error}</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* 파일 정보 */}
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div>
                  <p className="font-medium">{state.file?.name}</p>
                  <p className="text-sm text-gray-500">
                    {state.data.length}명의 크리에이터 데이터
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleReset(setState)}>
                다시 업로드
              </Button>
            </div>

            {/* 요약 통계 */}
            {(() => {
              const stats = calculateStats(state.data);
              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-600">크리에이터 수</p>
                    <p className="text-lg font-bold">{stats.creatorCount}명</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-green-600">총 매출</p>
                    <p className="text-lg font-bold">{formatRevenue(stats.totalRevenue)}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-xs text-purple-600">선물 수량</p>
                    <p className="text-lg font-bold">{stats.totalGiftCount.toLocaleString()}개</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-xs text-orange-600">참여 유저</p>
                    <p className="text-lg font-bold">{stats.totalSenderCount.toLocaleString()}명</p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const eventStats = eventPeriod.data.length > 0 ? calculateStats(eventPeriod.data) : null;
  const beforeStats = beforePeriod.data.length > 0 ? calculateStats(beforePeriod.data) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">
              <Link href="/events" className="hover:underline">이벤트 관리</Link>
              {' > '}
              <Link href={`/events/${eventId}`} className="hover:underline">{event?.name || '...'}</Link>
              {' > '}업로드
            </div>
            <h1 className="text-2xl font-bold text-gray-900">데이터 업로드</h1>
          </div>
          <Button
            disabled={viewMode === 'monitoring' ? eventPeriod.data.length === 0 : (eventPeriod.data.length === 0 || beforePeriod.data.length === 0)}
            onClick={() => {
              // 미리보기 데이터 준비
              const stats = calculateStats(eventPeriod.data);
              const ranking = eventPeriod.data
                .sort((a, b) => b.gold - a.gold)
                .map((item, index) => ({
                  rank: index + 1,
                  uid: item.uid,
                  nickname: item.nickname,
                  username: item.username,
                  gold: item.gold,
                  revenue: item.gold * 100,
                  giftCount: item.giftCount,
                  senderCount: item.senderCount,
                }));

              const previewData: Record<string, unknown> = {
                viewMode,
                dataStartDate,
                dataEndDate,
                summary: {
                  totalGold: stats.totalGold,
                  totalRevenue: stats.totalRevenue,
                  totalGiftCount: stats.totalGiftCount,
                  totalSenderCount: stats.totalSenderCount,
                  creatorCount: stats.creatorCount,
                },
                ranking,
              };

              if (viewMode === 'analysis' && beforePeriod.data.length) {
                const beforeStats = calculateStats(beforePeriod.data);
                previewData.beforeSummary = {
                  totalGold: beforeStats.totalGold,
                  totalRevenue: beforeStats.totalRevenue,
                  totalGiftCount: beforeStats.totalGiftCount,
                  totalSenderCount: beforeStats.totalSenderCount,
                  creatorCount: beforeStats.creatorCount,
                };
                previewData.beforeRanking = beforePeriod.data
                  .sort((a, b) => b.gold - a.gold)
                  .map((item, index) => ({
                    rank: index + 1,
                    uid: item.uid,
                    nickname: item.nickname,
                    username: item.username,
                    gold: item.gold,
                    revenue: item.gold * 100,
                    giftCount: item.giftCount,
                    senderCount: item.senderCount,
                  }));
              }

              sessionStorage.setItem('previewData', JSON.stringify(previewData));
              router.push(`/events/${eventId}/preview`);
            }}
          >
            대시보드 보기
          </Button>
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-1 mt-4 border-b -mb-4">
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              viewMode === 'monitoring'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setViewMode('monitoring')}
          >
            모니터링
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              viewMode === 'analysis'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setViewMode('analysis')}
          >
            성과분석
          </button>
        </div>
      </header>

      <main className="p-6 space-y-6 max-w-5xl mx-auto">
        {/* 데이터 기간 설정 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">데이터 기간</CardTitle>
            <CardDescription>업로드하는 CSV 데이터의 기간을 입력하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">시작일</label>
                <input
                  type="date"
                  value={dataStartDate}
                  onChange={(e) => setDataStartDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <span className="text-gray-400 mt-6">~</span>
              <div>
                <label className="block text-sm text-gray-500 mb-1">종료일</label>
                <input
                  type="date"
                  value={dataEndDate}
                  onChange={(e) => setDataEndDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 안내 메시지 */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="font-medium text-blue-900">업로드 안내</p>
                <p className="text-sm text-blue-700 mt-1">
                  {viewMode === 'monitoring'
                    ? '이벤트 기간 데이터를 업로드하면 실시간 모니터링 대시보드를 볼 수 있습니다.'
                    : '이벤트 기간과 직전 기간 데이터를 모두 업로드하면 성과 비교 분석이 가능합니다.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 업로드 영역 */}
        {viewMode === 'monitoring' ? (
          <div className="max-w-2xl mx-auto">
            <UploadArea
              state={eventPeriod}
              setState={setEventPeriod}
              title="이벤트 기간 데이터"
              description="이벤트 진행 기간의 선물 데이터"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UploadArea
              state={eventPeriod}
              setState={setEventPeriod}
              title="이벤트 기간 데이터"
              description="이벤트 진행 기간의 선물 데이터 (필수)"
            />
            <UploadArea
              state={beforePeriod}
              setState={setBeforePeriod}
              title="직전 기간 데이터"
              description="이벤트 직전 동일 기간의 선물 데이터 (필수)"
            />
          </div>
        )}

        {/* 비교 분석 미리보기 - 성과분석 모드에서만 */}
        {viewMode === 'analysis' && eventStats && beforeStats && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">성과 비교 미리보기</CardTitle>
              <CardDescription>이벤트 기간 vs 직전 기간</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: '매출', event: eventStats.totalRevenue, before: beforeStats.totalRevenue, format: formatRevenue },
                  { label: '선물 수량', event: eventStats.totalGiftCount, before: beforeStats.totalGiftCount, format: (v: number) => `${v.toLocaleString()}개` },
                  { label: '크리에이터', event: eventStats.creatorCount, before: beforeStats.creatorCount, format: (v: number) => `${v}명` },
                  { label: '참여 유저', event: eventStats.totalSenderCount, before: beforeStats.totalSenderCount, format: (v: number) => `${v.toLocaleString()}명` },
                ].map((item) => {
                  const growth = ((item.event - item.before) / item.before * 100).toFixed(1);
                  const isPositive = Number(growth) >= 0;
                  return (
                    <div key={item.label} className="border rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-2">{item.label}</p>
                      <p className="text-xl font-bold">{item.format(item.event)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">vs {item.format(item.before)}</span>
                        <span className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {isPositive ? '↑' : '↓'} {Math.abs(Number(growth))}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 데이터 미리보기 */}
        {(eventPeriod.data.length > 0 || (viewMode === 'analysis' && beforePeriod.data.length > 0)) && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">데이터 미리보기</CardTitle>
                {viewMode === 'analysis' && (
                  <div className="flex gap-1">
                    <Button
                      variant={activeTab === 'event' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTab('event')}
                      disabled={eventPeriod.data.length === 0}
                    >
                      이벤트 기간
                    </Button>
                    <Button
                      variant={activeTab === 'before' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTab('before')}
                      disabled={beforePeriod.data.length === 0}
                    >
                      직전 기간
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>크리에이터</TableHead>
                      <TableHead className="text-right">골드</TableHead>
                      <TableHead className="text-right">매출</TableHead>
                      <TableHead className="text-right">선물 수량</TableHead>
                      <TableHead className="text-right">참여 유저</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(viewMode === 'monitoring' ? eventPeriod.data : (activeTab === 'event' ? eventPeriod.data : beforePeriod.data))
                      .slice(0, 20)
                      .map((item, index) => (
                        <TableRow key={item.uid}>
                          <TableCell className="text-gray-500">{index + 1}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.nickname}</div>
                              <div className="text-xs text-gray-400">@{item.username}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-gray-500">
                            {item.gold.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatRevenue(item.gold * 100)}
                          </TableCell>
                          <TableCell className="text-right">{item.giftCount}개</TableCell>
                          <TableCell className="text-right">{item.senderCount}명</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                {(viewMode === 'monitoring' ? eventPeriod.data : (activeTab === 'event' ? eventPeriod.data : beforePeriod.data)).length > 20 && (
                  <p className="text-center text-sm text-gray-400 mt-4">
                    상위 20개만 표시됩니다. 전체 데이터는 대시보드에서 확인하세요.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
