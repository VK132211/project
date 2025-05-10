import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query, params } = request;
    const userAgent = request.get('user-agent') || 'unknown';

    const userId = request?.user?.id || 'UnAuthenticated';

    this.logger.log(
      `[${method} ${url} - User: ${userId}- UserAgenr ${userAgent}]`,
    );

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          const endTime = Date.now();
          const duration = endTime - startTime;

          this.logger.log(`${method} ${url}- ${duration}ms - response size- ${JSON.stringify(data).length}`);
        },
        error: (error) => {
          const endTime = Date.now();
          const duration = endTime - startTime;

          this.logger.log(
            `${method} ${url}- ${duration}ms - Error:${error.message}`,
          );
        },
      }),
    );
  }
}
