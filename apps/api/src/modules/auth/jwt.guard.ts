import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export type AuthUser = { id: string; email: string };

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(JwtService) private readonly jwt: JwtService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<{ headers: Record<string, string | undefined>; user?: AuthUser }>();
    const auth = req.headers['authorization'];
    if (!auth?.startsWith('Bearer ')) throw new UnauthorizedException('Missing bearer token');

    const token = auth.slice('Bearer '.length);
    const secret = this.config.get<string>('JWT_ACCESS_SECRET');
    if (!secret) throw new Error('JWT_ACCESS_SECRET is not set');

    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; email: string }>(token, { secret });
      req.user = { id: payload.sub, email: payload.email };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

