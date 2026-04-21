import { Controller, Get, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { PromptsModule } from './prompts/prompts.module';
import { UsageModule } from './usage/usage.module';

@Controller()
class RootController {
  @Get()
  root() {
    return {
      ok: true,
      service: 'lmnt-api',
      routes: {
        health: '/api/health',
        docs: '/api/docs',
      },
    };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HealthModule,
    AuthModule,
    UsageModule,
    ProjectsModule,
    PromptsModule,
  ],
  controllers: [RootController],
})
export class AppModule {}

