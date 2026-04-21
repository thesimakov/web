import { Inject, Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { prisma } from '@lmnt/database';
import bcrypt from 'bcryptjs';

function nowPlusSeconds(seconds: number) {
  return new Date(Date.now() + seconds * 1000);
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(JwtService) private readonly jwt: JwtService,
  ) {}

  private accessTtlSeconds(): number {
    return Number(this.config.get('JWT_ACCESS_TTL_SECONDS', 900));
  }

  private refreshTtlSeconds(): number {
    return Number(this.config.get('JWT_REFRESH_TTL_SECONDS', 60 * 60 * 24 * 30));
  }

  async signup(email: string, password: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true, createdAt: true },
    });

    await this.ensureFreeSubscription(user.id);
    return user;
  }

  async login(email: string, password: string) {
    const isDemo = email === 'demo@lmnt.dev' && password === 'demo';
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      if (!isDemo) throw new UnauthorizedException('Invalid credentials');
      const passwordHash = await bcrypt.hash(password, 12);
      user = await prisma.user.create({ data: { email, passwordHash } });
      await this.ensureFreeSubscription(user.id);
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.issueTokens(user.id, user.email);
    return { user: { id: user.id, email: user.email }, ...tokens };
  }

  async refresh(refreshToken: string) {
    const session = await prisma.session.findUnique({ where: { refreshToken } });
    if (!session) throw new UnauthorizedException('Invalid refresh token');
    if (session.expiresAt.getTime() < Date.now()) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) throw new UnauthorizedException('Invalid refresh token');

    await prisma.session.delete({ where: { id: session.id } });
    const tokens = await this.issueTokens(user.id, user.email);
    return { user: { id: user.id, email: user.email }, ...tokens };
  }

  async logout(refreshToken: string) {
    await prisma.session.delete({ where: { refreshToken } }).catch(() => undefined);
    return { ok: true };
  }

  private async issueTokens(userId: string, email: string) {
    const accessSecret = this.config.get<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET');
    if (!accessSecret || !refreshSecret) {
      throw new Error('JWT secrets are not configured');
    }

    const accessToken = await this.jwt.signAsync(
      { sub: userId, email },
      { secret: accessSecret, expiresIn: this.accessTtlSeconds() },
    );

    const refreshToken = await this.jwt.signAsync(
      { sub: userId, email, typ: 'refresh' },
      { secret: refreshSecret, expiresIn: this.refreshTtlSeconds() },
    );

    await prisma.session.create({
      data: {
        userId,
        refreshToken,
        expiresAt: nowPlusSeconds(this.refreshTtlSeconds()),
      },
    });

    return { accessToken, refreshToken };
  }

  private async ensureFreeSubscription(userId: string) {
    const plan = await prisma.plan.findUnique({ where: { key: 'FREE' } });
    if (!plan) {
      // планы будут засеяны миграцией/seed, но на dev держим страховку
      await prisma.plan.create({
        data: {
          key: 'FREE',
          name: 'Free',
          tokensPerDay: 5,
          sitesPerDay: 1,
          sitesPerMonth: 1,
          priorityQueue: false,
        },
      });
    }

    const existing = await prisma.subscription.findFirst({
      where: { userId, status: 'active' },
    });
    if (existing) return;

    await prisma.subscription.create({
      data: { userId, planKey: 'FREE', status: 'active' },
    });
  }
}

