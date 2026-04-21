import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsageModule } from '../usage/usage.module';
import { PromptsController } from './prompts.controller';
import { PromptsService } from './prompts.service';

@Module({
  imports: [AuthModule, UsageModule],
  controllers: [PromptsController],
  providers: [PromptsService],
})
export class PromptsModule {}

