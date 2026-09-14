import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError, lastValueFrom } from 'rxjs';
import { register } from 'prom-client';
import { HttpMetricsInterceptor } from './http-metrics.interceptor';

/**
 * Fabrique un ExecutionContext HTTP minimal pour l'intercepteur.
 */
function httpContext(req: Record<string, unknown>, res: Record<string, unknown>): ExecutionContext {
  return {
    getType: () => 'http',
    switchToHttp: () => ({
      getRequest: () => req,
      getResponse: () => res,
    }),
  } as unknown as ExecutionContext;
}

async function counterValue(labels: Record<string, string>): Promise<number> {
  const all = await register.getMetricsAsJSON();
  const metric = all.find((m) => m.name === 'http_requests_total');
  const match = metric?.values?.find((v) =>
    Object.entries(labels).every(([k, val]) => (v.labels as Record<string, string>)[k] === val)
  );
  return match?.value ?? 0;
}

describe('HttpMetricsInterceptor', () => {
  let interceptor: HttpMetricsInterceptor;

  beforeEach(() => {
    register.resetMetrics();
    interceptor = new HttpMetricsInterceptor();
  });

  it('compte une requête aboutie avec le patron de route et le status', async () => {
    const ctx = httpContext(
      { method: 'GET', path: '/orders/abc', route: { path: '/orders/:id' } },
      { statusCode: 200 }
    );
    const next: CallHandler = { handle: () => of({ ok: true }) };

    await lastValueFrom(interceptor.intercept(ctx, next));

    expect(await counterValue({ method: 'GET', route: '/orders/:id', status_code: '200' })).toBe(1);
  });

  it('compte une requête en erreur avec le status porté par l’exception', async () => {
    const ctx = httpContext(
      { method: 'POST', path: '/orders', route: { path: '/orders' } },
      { statusCode: 200 }
    );
    const next: CallHandler = {
      handle: () => throwError(() => ({ status: 502, message: 'Bad Gateway' })),
    };

    await expect(lastValueFrom(interceptor.intercept(ctx, next))).rejects.toMatchObject({
      status: 502,
    });

    expect(await counterValue({ method: 'POST', route: '/orders', status_code: '502' })).toBe(1);
  });

  it('range les routes non matchées sous "unmatched"', async () => {
    const ctx = httpContext({ method: 'GET', path: '/wp-admin' }, { statusCode: 404 });
    const next: CallHandler = { handle: () => of(undefined) };

    await lastValueFrom(interceptor.intercept(ctx, next));

    expect(await counterValue({ method: 'GET', route: 'unmatched', status_code: '404' })).toBe(1);
  });

  it('ignore le endpoint de scrape /metrics', async () => {
    const ctx = httpContext(
      { method: 'GET', path: '/metrics', route: { path: '/metrics' } },
      { statusCode: 200 }
    );
    const next: CallHandler = { handle: () => of('# HELP ...') };

    await lastValueFrom(interceptor.intercept(ctx, next));

    expect(await counterValue({ route: '/metrics' })).toBe(0);
  });

  it('laisse passer le résultat du handler inchangé', async () => {
    const ctx = httpContext(
      { method: 'GET', path: '/health', route: { path: '/health' } },
      { statusCode: 200 }
    );
    const payload = { status: 'ok' };
    const next: CallHandler = { handle: () => of(payload) };

    await expect(lastValueFrom(interceptor.intercept(ctx, next))).resolves.toBe(payload);
  });
});
