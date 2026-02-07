import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { question, rankingData, summary } = await request.json();

    if (!question) {
      return NextResponse.json({ error: '질문을 입력해주세요' }, { status: 400 });
    }

    // 랭킹 데이터를 텍스트로 변환
    const rankingText = rankingData
      .slice(0, 20) // 상위 20명만 전달 (토큰 절약)
      .map((r: { rank: number; nickname: string; gold: number; revenue: number; giftCount: number; senderCount: number }) =>
        `${r.rank}위: ${r.nickname} - 매출 ${(r.revenue / 10000).toFixed(0)}만원, 골드 ${r.gold.toLocaleString()}, 선물 ${r.giftCount}개, 참여유저 ${r.senderCount}명`
      )
      .join('\n');

    const systemPrompt = `당신은 LIKEY 이벤트 데이터 분석 전문가입니다.
사용자의 질문에 친절하고 명확하게 답변해주세요.
숫자는 읽기 쉽게 포맷팅해주세요 (예: 1,234,567원 또는 123만원).
답변은 간결하게 2-3문장으로 해주세요.

현재 대시보드 요약:
- 총 매출: ${(summary.totalRevenue / 100000000).toFixed(2)}억원 (${summary.totalRevenue.toLocaleString()}원)
- 총 골드: ${summary.totalGold.toLocaleString()}
- 총 선물 수량: ${summary.totalGiftCount.toLocaleString()}개
- 참여 유저 수: ${summary.totalSenderCount.toLocaleString()}명
- 크리에이터 수: ${summary.creatorCount}명

크리에이터 랭킹 (상위 20명):
${rankingText}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const answer = completion.choices[0]?.message?.content || '답변을 생성할 수 없습니다.';

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'AI 응답 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
