import 'server-only';
import { readFile, writeFile, rename, unlink } from 'node:fs/promises';
import { join } from 'node:path';
const path = () => join(process.cwd(), '.env.local');
export const defaultModel = 'gpt-5-mini';
export function aiConfig() {
  return {
    configured: !!process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || defaultModel,
  };
}
let saving = false;
export async function saveOpenAIKey(key: string, model: string) {
  if (saving) throw new Error('Configuration save in progress');
  saving = true;
  const temp = path() + '.' + crypto.randomUUID() + '.tmp';
  try {
    let current = '';
    try {
      current = await readFile(path(), 'utf8');
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
    }
    const lines = current
      .split(/\r?\n/)
      .filter((line) => !/^\s*(?:export\s+)?OPENAI_(API_KEY|MODEL)\s*=/.test(line));
    const next = [...lines, `OPENAI_API_KEY=${key}`, `OPENAI_MODEL=${model}`, ''].join('\n');
    await writeFile(temp, next, { mode: 0o600, flag: 'wx' });
    await rename(temp, path());
    process.env.OPENAI_API_KEY = key;
    process.env.OPENAI_MODEL = model;
  } finally {
    saving = false;
    await unlink(temp).catch(() => {});
  }
}
