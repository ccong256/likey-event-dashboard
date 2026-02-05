'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

// 골드 → 매출 변환 (1골드 = 100원)
const GOLD_TO_KRW = 100;

// 빼빼로데이 이벤트 전체 데이터 (실제 CSV 기반)
const giftData = [
  { rank: 1, nickname: '🌸Sakuraღ유아💕', username: 'sakura_YuA', gold: 233690, giftCount: 443, senderCount: 49 },
  { rank: 2, nickname: '시아 Sia🥑', username: 'sia_s2022', gold: 166688, giftCount: 51, senderCount: 8 },
  { rank: 3, nickname: 'G바겐', username: 'gclass0714', gold: 136306, giftCount: 134, senderCount: 44 },
  { rank: 4, nickname: '🌸아인🔞🌸', username: 'Ainnee2378', gold: 100947, giftCount: 161, senderCount: 57 },
  { rank: 5, nickname: '달순이', username: 'cloud_8030', gold: 97864, giftCount: 33, senderCount: 11 },
  { rank: 6, nickname: '반서지', username: 'banseozi', gold: 74108, giftCount: 250, senderCount: 40 },
  { rank: 7, nickname: '하루짱', username: 'ruzzxng', gold: 62788, giftCount: 11, senderCount: 8 },
  { rank: 8, nickname: '김유나', username: 'dengd2ng', gold: 60006, giftCount: 81, senderCount: 10 },
  { rank: 9, nickname: 'miyu 💜', username: 'love_miyu', gold: 41471, giftCount: 43, senderCount: 12 },
  { rank: 10, nickname: '전보연 boyeon', username: '171jun2021', gold: 31545, giftCount: 17, senderCount: 9 },
  { rank: 11, nickname: '다송', username: 'dearsongi', gold: 25471, giftCount: 12, senderCount: 5 },
  { rank: 12, nickname: '묘화', username: 'myohwa00', gold: 21377, giftCount: 56, senderCount: 19 },
  { rank: 13, nickname: '고은비', username: 'shushu_22', gold: 20233, giftCount: 23, senderCount: 7 },
  { rank: 14, nickname: '백설양 Snow', username: 'uoujjj', gold: 19878, giftCount: 40, senderCount: 19 },
  { rank: 15, nickname: 'Hyo원', username: 'hyoone', gold: 18225, giftCount: 50, senderCount: 19 },
  { rank: 16, nickname: '모구모구🍑 mogu', username: 'moguu__mogu', gold: 15426, giftCount: 19, senderCount: 8 },
  { rank: 17, nickname: '한주', username: 'hanjoo_', gold: 13732, giftCount: 33, senderCount: 5 },
  { rank: 18, nickname: '채온', username: 'kimsoomjjin', gold: 13525, giftCount: 20, senderCount: 6 },
  { rank: 19, nickname: '미스김 누나🖤', username: 'women2025', gold: 13497, giftCount: 151, senderCount: 33 },
  { rank: 20, nickname: '새옴', username: 'om0322', gold: 12750, giftCount: 37, senderCount: 21 },
  { rank: 21, nickname: '선아', username: 'Sun_Ah', gold: 11873, giftCount: 23, senderCount: 9 },
  { rank: 22, nickname: '여니 🐰', username: 'Yeoni_Mochi', gold: 9060, giftCount: 47, senderCount: 6 },
  { rank: 23, nickname: '히츄💋', username: 's2chuuuu', gold: 8856, giftCount: 69, senderCount: 17 },
  { rank: 24, nickname: '은아', username: 'Y2ujin._', gold: 8238, giftCount: 7, senderCount: 2 },
  { rank: 25, nickname: '유치땅', username: 'youchi0_0', gold: 7712, giftCount: 60, senderCount: 13 },
  { rank: 26, nickname: 'Katainao🐰', username: 'katainao', gold: 6943, giftCount: 14, senderCount: 3 },
  { rank: 27, nickname: '유나💦', username: 'jkjk6958', gold: 6743, giftCount: 10, senderCount: 5 },
  { rank: 28, nickname: 'Now__on 현재', username: 'now__ness', gold: 6736, giftCount: 51, senderCount: 2 },
  { rank: 29, nickname: '진다율 Jin da yul', username: 'jin_dayul', gold: 6551, giftCount: 29, senderCount: 7 },
  { rank: 30, nickname: '쑤 Soo💋', username: 'swai_sy', gold: 6355, giftCount: 6, senderCount: 5 },
  { rank: 31, nickname: 'K-cup꿀하린🍯HARIN', username: 'da2018', gold: 6023, giftCount: 5, senderCount: 3 },
  { rank: 32, nickname: '지니🩷', username: 'maximgini', gold: 5920, giftCount: 12, senderCount: 5 },
  { rank: 33, nickname: '채라 Chaera🐹', username: 'chae__.ra', gold: 5429, giftCount: 31, senderCount: 13 },
  { rank: 34, nickname: '아음', username: 'Aheumm', gold: 5297, giftCount: 8, senderCount: 4 },
  { rank: 35, nickname: '이린', username: '2lyn_98', gold: 4688, giftCount: 11, senderCount: 5 },
  { rank: 36, nickname: 'ddiddi', username: 'ddiddi', gold: 4652, giftCount: 52, senderCount: 5 },
  { rank: 37, nickname: '세림잉', username: 'serimm11', gold: 4651, giftCount: 108, senderCount: 4 },
  { rank: 38, nickname: '미시차유리', username: 'MissyChayuri', gold: 4537, giftCount: 23, senderCount: 9 },
  { rank: 39, nickname: '하윤', username: 'asdfzxcv', gold: 4111, giftCount: 2, senderCount: 1 },
  { rank: 40, nickname: 'Harusaki', username: 'Harusaki', gold: 3815, giftCount: 30, senderCount: 3 },
];

// 전체 데이터에서 계산 (골드)
const totalGold = 1508029;
const totalGiftCount = 4471;
const totalSenderCount = 1427;
const totalCreatorCount = giftData.length;

// 이전 기간 데이터 (직전 7일)
const prevTotalGold = 980000;
const prevTotalGiftCount = 2800;
const prevSenderCount = 950;
const prevCreatorCount = 30;

// 매출 계산
const totalRevenue = totalGold * GOLD_TO_KRW;
const prevTotalRevenue = prevTotalGold * GOLD_TO_KRW;

// 증가율 계산
const revenueGrowth = ((totalRevenue - prevTotalRevenue) / prevTotalRevenue * 100).toFixed(1);
const giftGrowth = ((totalGiftCount - prevTotalGiftCount) / prevTotalGiftCount * 100).toFixed(1);
const senderGrowth = ((totalSenderCount - prevSenderCount) / prevSenderCount * 100).toFixed(1);
const creatorGrowth = ((totalCreatorCount - prevCreatorCount) / prevCreatorCount * 100).toFixed(1);

const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'];

// 매출 포맷팅 함수
const formatRevenue = (value: number) => {
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(1)}억원`;
  } else if (value >= 10000) {
    return `${(value / 10000).toFixed(0)}만원`;
  }
  return `${value.toLocaleString()}원`;
};

type SortKey = 'rank' | 'gold' | 'giftCount' | 'senderCount';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'monitoring' | 'analysis';

export default function MonitoringDashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>('monitoring');
  const [topN, setTopN] = useState<5 | 10>(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('2025-11-05');
  const [endDate, setEndDate] = useState('2025-11-12');
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const itemsPerPage = 10;

  const isAnalysis = viewMode === 'analysis';

  // 정렬 함수
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder(key === 'rank' ? 'asc' : 'desc');
    }
    setCurrentPage(1);
  };

  // 정렬된 데이터
  const sortedData = [...giftData].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    return (a[sortKey] - b[sortKey]) * multiplier;
  });

  // 차트 데이터 (매출 기준)
  const topChartData = giftData.slice(0, topN).map(d => ({
    name: d.nickname.length > 8 ? d.nickname.slice(0, 8) + '...' : d.nickname,
    매출: d.gold * GOLD_TO_KRW,
  }));

  // 페이지네이션
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 정렬 아이콘
  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) {
      return <span className="ml-1 text-gray-300">↕</span>;
    }
    return <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">빼빼로데이 선물 이벤트</h1>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              />
              <span className="text-gray-500">~</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              />
            </div>
          </div>
          <Badge variant="default" className="bg-green-500">진행중</Badge>
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
            className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-300 cursor-not-allowed"
            disabled
            title="준비중입니다"
          >
            성과분석
          </button>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">총 매출</CardTitle>
              {isAnalysis && (
                <span className={`text-xs font-medium ${Number(revenueGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Number(revenueGrowth) >= 0 ? '↑' : '↓'} {revenueGrowth}%
                </span>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatRevenue(totalRevenue)}</div>
              {isAnalysis && (
                <p className="text-xs text-gray-400 mt-1">직전 기간: {formatRevenue(prevTotalRevenue)}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">선물 수량</CardTitle>
              {isAnalysis && (
                <span className={`text-xs font-medium ${Number(giftGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Number(giftGrowth) >= 0 ? '↑' : '↓'} {giftGrowth}%
                </span>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalGiftCount.toLocaleString()}개</div>
              {isAnalysis && (
                <p className="text-xs text-gray-400 mt-1">직전 기간: {prevTotalGiftCount.toLocaleString()}개</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">참여 유저 수</CardTitle>
              {isAnalysis && (
                <span className={`text-xs font-medium ${Number(senderGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Number(senderGrowth) >= 0 ? '↑' : '↓'} {senderGrowth}%
                </span>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSenderCount.toLocaleString()}명</div>
              {isAnalysis && (
                <p className="text-xs text-gray-400 mt-1">직전 기간: {prevSenderCount.toLocaleString()}명</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">선물 받은 크리에이터</CardTitle>
              {isAnalysis && (
                <span className={`text-xs font-medium ${Number(creatorGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Number(creatorGrowth) >= 0 ? '↑' : '↓'} {creatorGrowth}%
                </span>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCreatorCount.toLocaleString()}명</div>
              {isAnalysis && (
                <p className="text-xs text-gray-400 mt-1">직전 기간: {prevCreatorCount.toLocaleString()}명</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">TOP {topN} 크리에이터 매출</CardTitle>
              <div className="flex gap-1">
                <Button
                  variant={topN === 5 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTopN(5)}
                >
                  TOP 5
                </Button>
                <Button
                  variant={topN === 10 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTopN(10)}
                >
                  TOP 10
                </Button>
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

          {/* Pie Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">TOP {topN} 매출 점유율</CardTitle>
              <div className="flex gap-1">
                <Button
                  variant={topN === 5 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTopN(5)}
                >
                  TOP 5
                </Button>
                <Button
                  variant={topN === 10 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTopN(10)}
                >
                  TOP 10
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className={topN === 5 ? 'h-[300px]' : 'h-[450px]'}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={giftData.slice(0, topN).map(d => ({
                        name: d.nickname,
                        value: d.gold * GOLD_TO_KRW,
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={topN === 5 ? 60 : 80}
                      outerRadius={topN === 5 ? 100 : 140}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${(name || '').slice(0, 5)}.. ${((percent || 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {giftData.slice(0, topN).map((_, index) => (
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

        {/* Ranking Table with Pagination */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">전체 크리에이터 랭킹 (매출 기준)</CardTitle>
            <span className="text-sm text-gray-500">총 {giftData.length}명</span>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="w-16 cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('rank')}
                  >
                    순위<SortIcon columnKey="rank" />
                  </TableHead>
                  <TableHead>크리에이터</TableHead>
                  <TableHead
                    className="text-right cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('gold')}
                  >
                    골드<SortIcon columnKey="gold" />
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('gold')}
                  >
                    매출<SortIcon columnKey="gold" />
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('giftCount')}
                  >
                    선물 수량<SortIcon columnKey="giftCount" />
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('senderCount')}
                  >
                    참여 유저<SortIcon columnKey="senderCount" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((creator, index) => {
                  const position = (currentPage - 1) * itemsPerPage + index + 1;
                  const currentRank = sortOrder === 'desc'
                    ? position
                    : sortedData.length - position + 1;
                  return (
                  <TableRow key={creator.username}>
                    <TableCell>
                      {currentRank <= 3 ? (
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-sm font-bold ${
                          currentRank === 1 ? 'bg-yellow-500' :
                          currentRank === 2 ? 'bg-gray-400' :
                          'bg-amber-600'
                        }`}>
                          {currentRank}
                        </span>
                      ) : (
                        <span className="text-gray-500">{currentRank}</span>
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
                      {formatRevenue(creator.gold * GOLD_TO_KRW)}
                    </TableCell>
                    <TableCell className="text-right">
                      {creator.giftCount.toLocaleString()}개
                    </TableCell>
                    <TableCell className="text-right">
                      {creator.senderCount}명
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <span className="text-sm text-gray-500">
                {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, giftData.length)} / {giftData.length}
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
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
