import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../utils/current-user.decorator';
import { CreateProjectDto } from './dto';
import { ProjectsService } from './projects.service';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  async list(@CurrentUser() user: { id: string }) {
    return { projects: await this.projects.list(user.id) };
  }

  @Post()
  async create(@CurrentUser() user: { id: string }, @Body() dto: CreateProjectDto) {
    return { project: await this.projects.create(user.id, dto.name) };
  }
}

