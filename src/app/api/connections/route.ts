import { aiConfig, saveOpenAIKey } from '@/lib/openai-config';
import { apiError, readSmallJson, requireLocalMutation } from '@/lib/local-api';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  return Response.json(
    {
      openai: aiConfig(),
      abs: { configured: true, service: 'ABS public Data API (Beta)' },
      listings: { configured: false },
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
export async function POST(request: Request) {
  try {
    requireLocalMutation(request);
  } catch {
    return apiError('Configure the model from this local app only.', 403);
  }
  let body: unknown;
  try {
    body = await readSmallJson(request, 4000);
  } catch {
    return apiError('Invalid configuration request.', 400);
  }
  const b = body as Record<string, unknown> | null;
  if (
    !b ||
    typeof b.apiKey !== 'string' ||
    !/^sk-[A-Za-z0-9_-]{20,500}$/.test(b.apiKey) ||
    typeof b.model !== 'string' ||
    !/^gpt-[A-Za-z0-9._:-]{1,70}$/.test(b.model)
  )
    return apiError('Enter a valid OpenAI API key and model ID.', 400);
  try {
    await saveOpenAIKey(b.apiKey, b.model);
    return Response.json(
      {
        openai: aiConfig(),
        message: 'Saved on this computer. Send a research question to verify access.',
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return apiError('Could not save configuration. Check local file permissions.', 500);
  }
}
