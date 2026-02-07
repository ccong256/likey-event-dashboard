'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RankingItem {
  rank: number;
  nickname: string;
  gold: number;
  revenue: number;
  giftCount: number;
  senderCount: number;
}

interface Summary {
  totalGold: number;
  totalRevenue: number;
  totalGiftCount: number;
  totalSenderCount: number;
  creatorCount: number;
}

interface AskAIProps {
  rankingData: RankingItem[];
  summary: Summary;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AskAI({ rankingData, summary }: AskAIProps) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const exampleQuestions = [
    '1등과 2등의 매출 차이는?',
    'TOP 5가 전체 매출에서 차지하는 비율은?',
    '평균 매출은 얼마야?',
    '선물을 가장 많이 받은 크리에이터는?',
  ];

  const handleAsk = async (q?: string) => {
    const questionToAsk = q || question;
    if (!questionToAsk.trim()) return;

    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: questionToAsk }]);
    setQuestion('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionToAsk,
          rankingData,
          summary,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `오류: ${data.error}` }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '네트워크 오류가 발생했습니다.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          AI에게 질문하기
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 예시 질문 버튼 */}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {exampleQuestions.map((eq, i) => (
              <button
                key={i}
                onClick={() => handleAsk(eq)}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                {eq}
              </button>
            ))}
          </div>
        )}

        {/* 대화 내역 */}
        {messages.length > 0 && (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-50 text-blue-900 ml-8'
                    : 'bg-gray-50 text-gray-900 mr-8'
                }`}
              >
                <span className="text-xs text-gray-500 block mb-1">
                  {msg.role === 'user' ? '나' : 'AI'}
                </span>
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="p-3 rounded-lg bg-gray-50 mr-8">
                <span className="text-xs text-gray-500 block mb-1">AI</span>
                <span className="text-gray-400">생각 중...</span>
              </div>
            )}
          </div>
        )}

        {/* 입력창 */}
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleAsk()}
            placeholder="데이터에 대해 질문하세요..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <Button onClick={() => handleAsk()} disabled={isLoading || !question.trim()}>
            질문
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
