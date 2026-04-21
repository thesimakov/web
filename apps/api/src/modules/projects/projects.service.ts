import { ConflictException, Injectable } from '@nestjs/common';
import { prisma } from '@lmnt/database';
import { nanoid } from 'nanoid';

function slugify(name: string) {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40);
  return base || `project-${nanoid(6).toLowerCase()}`;
}

@Injectable()
export class ProjectsService {
  async list(userId: string) {
    return await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, slug: true, createdAt: true, updatedAt: true },
    });
  }

  async create(userId: string, name: string) {
    const slug = slugify(name);
    const existing = await prisma.project.findUnique({
      where: { userId_slug: { userId, slug } },
    });
    if (existing) throw new ConflictException('Project slug already exists');

    return await prisma.project.create({
      data: { userId, name, slug, config: { create: {} } },
      select: { id: true, name: true, slug: true, createdAt: true, updatedAt: true },
    });
  }
}

