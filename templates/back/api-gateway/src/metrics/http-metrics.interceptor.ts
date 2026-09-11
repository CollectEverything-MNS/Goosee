import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import type { Request, Response } from 'express';
import { httpRequestDurationSeconds, httpRequestsTotal } from './http-metrics';

/**
 * Intercepteur global : mesure débit, erreurs et latence de chaque requête HTTP
 * entrante et alimente les métriques Prometheus RED.
 *
 * Le chrono couvre le passage dans la gateway (validation + proxy vers le
 * microservice amont + sérialisation de la réponse). Les réponses en erreur
 * sont comptées via `tap({ error })` : NestJS transforme l'exception en réponse
 * HTTP après l'intercepteur, donc on lit le code sur l'objet exception.
 */
@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    // Le endpoint de scrape ne doit pas se mesurer lui-même.
    if (request.path === '/metrics') {
      return next.handle();
    }

    const method = request.method;
    const endTimer = httpRequestDurationSeconds.startTimer();

    const record = (statusCode: number) => {
      // `request.route` n'existe que si une route a matché : les 404 tombent sur
      // `unmatched` pour éviter d'indexer des URLs arbitraires (scans, fuzzing).
      const route = (request.route as { path?: string } | undefined)?.path ?? 'unmatched';
      const labels = { method, route, status_code: String(statusCode) };
      httpRequestsTotal.inc(labels);
      endTimer(labels);
    };

    return next.handle().pipe(
      tap({
        next: () => record(response.statusCode),
        error: (err: { status?: number; statusCode?: number }) =>
          record(err?.status ?? err?.statusCode ?? 500),
      })
    );
  }
}
