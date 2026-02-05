'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';

interface EventForm {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  targetCountries: string[];
}

const countries = [
  { code: 'KR', name: '한국' },
  { code: 'TW', name: '대만' },
  { code: 'TH', name: '태국' },
  { code: 'JP', name: '일본' },
  { code: 'VN', name: '베트남' },
  { code: 'MY', name: '말레이시아' },
  { code: 'CN', name: '중국' },
];

export default function NewEventPage() {
  const router = useRouter();
  const [form, setForm] = useState<EventForm>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    targetCountries: ['KR'],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof EventForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof EventForm, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // 에러 클리어
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleCountry = (code: string) => {
    setForm((prev) => ({
      ...prev,
      targetCountries: prev.targetCountries.includes(code)
        ? prev.targetCountries.filter((c) => c !== code)
        : [...prev.targetCountries, code],
    }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof EventForm, string>> = {};

    if (!form.name.trim()) {
      newErrors.name = '이벤트명을 입력해주세요';
    }
    if (!form.startDate) {
      newErrors.startDate = '시작일을 선택해주세요';
    }
    if (!form.endDate) {
      newErrors.endDate = '종료일을 선택해주세요';
    }
    if (form.startDate && form.endDate && form.startDate > form.endDate) {
      newErrors.endDate = '종료일은 시작일 이후여야 합니다';
    }
    if (form.targetCountries.length === 0) {
      newErrors.targetCountries = '최소 1개 국가를 선택해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    const { error } = await supabase.from('events').insert({
      name: form.name,
      description: form.description || null,
      start_date: form.startDate,
      end_date: form.endDate,
      target_countries: form.targetCountries,
      status: 'active',
    });

    if (error) {
      console.error('Error creating event:', error);
      alert('이벤트 등록 중 오류가 발생했습니다.');
      setIsSubmitting(false);
      return;
    }

    router.push('/events');
  };

  const getDuration = () => {
    if (!form.startDate || !form.endDate) return null;
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (diff < 1) return null;
    return diff;
  };

  const duration = getDuration();

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
              {' > '}새 이벤트
            </div>
            <h1 className="text-2xl font-bold text-gray-900">새 이벤트 등록</h1>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">기본 정보</CardTitle>
              <CardDescription>이벤트의 기본 정보를 입력해주세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 이벤트명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이벤트명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="예: 빼빼로데이 선물 이벤트"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* 설명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="이벤트에 대한 간단한 설명을 입력해주세요"
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* 기간 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">기간 설정</CardTitle>
              <CardDescription>이벤트 진행 기간을 설정해주세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* 시작일 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    시작일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
                  )}
                </div>

                {/* 종료일 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    종료일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.endDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                  )}
                </div>
              </div>

              {/* 기간 표시 */}
              {duration && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    이벤트 기간: <strong>{duration}일</strong>
                  </p>
                  <p className="text-xs text-blue-500 mt-1">
                    직전 기간 비교 분석 시 동일하게 {duration}일 기준으로 비교됩니다
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 대상 국가 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">대상 국가</CardTitle>
              <CardDescription>이벤트 대상 국가를 선택해주세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {countries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => toggleCountry(country.code)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      form.targetCountries.includes(country.code)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    {country.name} ({country.code})
                  </button>
                ))}
              </div>
              {errors.targetCountries && (
                <p className="text-red-500 text-sm mt-2">{errors.targetCountries}</p>
              )}

              {/* 선택된 국가 */}
              {form.targetCountries.length > 0 && (
                <div className="mt-4 flex gap-2">
                  <span className="text-sm text-gray-500">선택됨:</span>
                  {form.targetCountries.map((code) => (
                    <Badge key={code} variant="outline">
                      {code}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 제출 버튼 */}
          <div className="flex gap-3 justify-end">
            <Link href="/events">
              <Button type="button" variant="outline">
                취소
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '등록 중...' : '이벤트 등록'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
