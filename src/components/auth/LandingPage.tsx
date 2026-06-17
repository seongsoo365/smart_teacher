import Link from 'next/link';
import { FlaskConical, BookOpen, Brain, BarChart3, ArrowRight } from 'lucide-react';

const FEATURES = [
  {
    icon: BookOpen,
    color: 'bg-blue-100 text-blue-600',
    title: '전체 교육과정 커버',
    desc: '중학교 1~3학년, 고등 통합과학·물리·화학·생명과학·지구과학 I 전 단원',
  },
  {
    icon: Brain,
    color: 'bg-purple-100 text-purple-600',
    title: 'AI 맞춤형 문제',
    desc: '기본·심화·응용 3단계 난이도, AI가 단원별 개념에 최적화된 문제를 즉시 생성',
  },
  {
    icon: FlaskConical,
    color: 'bg-green-100 text-green-600',
    title: 'AI 학습 카운슬러',
    desc: '풀이 후 오개념 진단, 개인화된 학습 가이드와 다음 학습 단계를 1:1로 안내',
  },
  {
    icon: BarChart3,
    color: 'bg-orange-100 text-orange-600',
    title: '학습 진도 추적',
    desc: '단원별 습득도(0~100%), 취약 단원 자동 감지, 학습 이력 시각화',
  },
];

export function LandingPage() {
  return (
    <div className="space-y-16 pb-16">
      {/* 히어로 */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-8 py-16 text-center text-white">
        <div className="relative z-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <FlaskConical className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
            스마트티처
          </h1>
          <p className="mt-3 text-lg font-medium text-blue-200">
            AI 기반 1:1 과학 학습 플랫폼
          </p>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-blue-100">
            한국 중·고등 과학 교육과정 전체를 커버하는 AI 학습 도우미입니다.
            개념 학습부터 난이도별 문제풀이, 개인 카운슬링까지 한 번에.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/auth"
              className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-blue-700 shadow transition hover:bg-blue-50"
            >
              무료로 시작하기
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth"
              className="rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              로그인
            </Link>
          </div>
        </div>

        {/* 배경 장식 */}
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 left-8 h-40 w-40 rounded-full bg-white/5" />
      </section>

      {/* 기능 소개 */}
      <section>
        <h2 className="mb-6 text-center text-xl font-bold text-gray-800">
          스마트티처가 특별한 이유
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, color, title, desc }) => (
            <div
              key={title}
              className="flex gap-4 rounded-2xl border bg-white p-5 shadow-sm"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl bg-gray-50 px-6 py-10 text-center">
        <p className="text-lg font-bold text-gray-800">지금 바로 시작해보세요</p>
        <p className="mt-1 text-sm text-gray-400">
          카카오 또는 구글 계정으로 1분 안에 가입 완료
        </p>
        <Link
          href="/auth"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          회원가입 / 로그인
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
