import app from './app';
import type { Env } from './env';
import { warmupLiveData } from './lib/warmup';

export default {
  fetch: (request: Request, env: Env, ctx: ExecutionContext) => app.fetch(request, env, ctx),
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(warmupLiveData(env));
  },
};
