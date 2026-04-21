import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../utils/current-user.decorator';
import { GeneratePromptDto } from './dto';
import { PromptsService } from './prompts.service';

@ApiTags('prompts')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('prompts')
export class PromptsController {
  constructor(private readonly prompts: PromptsService) {}

  @Post('generate')
  async generate(@CurrentUser() user: { id: string }, @Body() dto: GeneratePromptDto) {
    return await this.prompts.generateSpec(user.id, dto.projectId, dto.idea);
  }

  @Get()
  async list(@CurrentUser() user: { id: string }, @Query('projectId') projectId?: string) {
    if (!projectId) return { prompts: [] };
    return { prompts: await this.prompts.listProjectPrompts(user.id, projectId) };
  }
}

