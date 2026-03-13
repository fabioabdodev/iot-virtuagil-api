import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async create(dto: CreateUserDto) {
    await this.ensureClientExists(dto.clientId);

    return this.prisma.user.create({
      data: {
        clientId: dto.clientId,
        name: dto.name,
        email: dto.email.toLowerCase().trim(),
        passwordHash: this.authService.hashPassword(dto.password),
        role: dto.role ?? 'operator',
        phone: dto.phone,
        isActive: dto.isActive ?? true,
      } as any,
    });
  }

  async list(clientId?: string) {
    const where = clientId ? ({ clientId } as any) : undefined;
    return this.prisma.user.findMany({
      where,
      orderBy: [{ clientId: 'asc' }, { name: 'asc' }],
      select: this.userSelect(),
    } as any);
  }

  async findOne(id: string, clientId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelect(),
    } as any);
    if (!user) throw new NotFoundException('User not found');
    if (clientId && (user as any).clientId !== clientId) {
      throw new NotFoundException('User not found for client');
    }
    return user;
  }

  async update(id: string, dto: UpdateUserDto, clientId?: string) {
    await this.findOne(id, clientId);
    await this.ensureClientExists(dto.clientId);

    return this.prisma.user.update({
      where: { id },
      data: {
        clientId: dto.clientId,
        name: dto.name,
        email: dto.email?.toLowerCase().trim(),
        passwordHash: dto.password
          ? this.authService.hashPassword(dto.password)
          : undefined,
        role: dto.role,
        phone: dto.phone,
        isActive: dto.isActive,
      } as any,
      select: this.userSelect(),
    } as any);
  }

  async remove(id: string, clientId?: string) {
    await this.findOne(id, clientId);
    return this.prisma.user.delete({
      where: { id },
      select: this.userSelect(),
    } as any);
  }

  private async ensureClientExists(clientId?: string) {
    if (!clientId) return;
    const client = await this.prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      throw new BadRequestException('clientId does not exist');
    }
  }

  private userSelect() {
    return {
      id: true,
      clientId: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    };
  }
}
