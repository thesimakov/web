import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthUser } from '../auth/jwt.guard';

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): AuthUser => {
  const req = ctx.switchToHttp().getRequest<{ user?: AuthUser }>();
  if (!req.user) throw new Error('CurrentUser used without JwtGuard');
  return req.user;
});

