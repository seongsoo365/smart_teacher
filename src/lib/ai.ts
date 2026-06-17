import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

// Gemini 2.5 Flash – 최신 고성능 모델
const model = google('gemini-2.5-flash');

/**
 * Gemini 응답에서 JSON 객체/배열만 추출한다.
 * 코드블록 제거 후 첫 번째 { ~ 마지막 } 구간을 슬라이싱해
 * 앞뒤에 설명 텍스트가 섞여도 안전하게 파싱할 수 있다.
 */
function extractJson(raw: string): string {
  const stripped = raw
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();

  const start = stripped.indexOf('{');
  const end = stripped.lastIndexOf('}');

  if (start !== -1 && end !== -1 && end > start) {
    return stripped.slice(start, end + 1);
  }

  // 객체가 없으면 원본 반환 (호출측에서 JSON.parse 실패 처리)
  return stripped;
}

/**
 * Gemini 호출 공통 함수.
 * 한국어 응답은 토큰 대비 글자 수가 적으므로 기본값을 8192로 설정한다.
 */
export async function callGemini(prompt: string, maxOutputTokens = 8192): Promise<string> {
  const { text } = await generateText({
    model,
    prompt,
    maxOutputTokens,
  });

  return extractJson(text);
}
