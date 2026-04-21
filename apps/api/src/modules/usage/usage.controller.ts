import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../utils/current-user.decorator';
import { UsageService } from './usage.service';

@ApiTags('usage')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('usage')
export class UsageController {
  constructor(private readonly usage: UsageService) {}

  @Get('me')
  async me(@CurrentUser() user: { id: string }) {
    const [plan, usage] = await Promise.all([
      this.usage.getActivePlan(user.id),
      this.usage.getUsage(user.id),
    ]);
    return { plan, usage };
  }
}

