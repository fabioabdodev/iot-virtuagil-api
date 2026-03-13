import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

type AuthTokenPayload = {
  sub: string;
  email: string;
  role: string;
  clientId: string | null;
  exp: number;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    } as any);

    if (
      !user ||
      !(user as any).isActive ||
      !this.verifyPassword(dto.password, (user as any).passwordHash)
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.prisma.user.update({
      where: { id: (user as any).id },
      data: { lastLoginAt: new Date() },
    } as any);

    const token = this.signToken({
      sub: (user as any).id,
      email: (user as any).email,
      role: (user as any).role,
      clientId: (user as any).clientId ?? null,
      exp: this.buildExpiryTimestamp(),
    });

    return {
      token,
      user: this.sanitizeUser({
        ...(user as any),
        lastLoginAt: new Date(),
      }),
    };
  }

  async me(authorization?: string) {
    const payload = this.verifyAuthorizationHeader(authorization);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    } as any);

    if (!user) {
      throw new UnauthorizedException('Session user not found');
    }

    return this.sanitizeUser(user);
  }

  hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  private sanitizeUser(user: any) {
    return {
      id: user.id,
      clientId: user.clientId ?? null,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone ?? null,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private verifyAuthorizationHeader(authorization?: string) {
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const token = authorization.slice('Bearer '.length).trim();
    return this.verifyToken(token);
  }

  private signToken(payload: AuthTokenPayload) {
    const encodedPayload = this.toBase64Url(JSON.stringify(payload));
    const signature = this.createSignature(encodedPayload);
    return `${encodedPayload}.${signature}`;
  }

  private verifyToken(token: string): AuthTokenPayload {
    const [encodedPayload, providedSignature] = token.split('.');
    if (!encodedPayload || !providedSignature) {
      throw new UnauthorizedException('Invalid token format');
    }

    const expectedSignature = this.createSignature(encodedPayload);
    if (
      Buffer.byteLength(providedSignature) !== Buffer.byteLength(expectedSignature) ||
      !timingSafeEqual(Buffer.from(providedSignature), Buffer.from(expectedSignature))
    ) {
      throw new UnauthorizedException('Invalid token signature');
    }

    let payload: AuthTokenPayload;
    try {
      payload = JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString('utf8'),
      ) as AuthTokenPayload;
    } catch {
      throw new UnauthorizedException('Invalid token payload');
    }

    if (!payload?.sub || !payload?.email || !payload?.exp) {
      throw new UnauthorizedException('Invalid token payload');
    }

    if (payload.exp <= Date.now()) {
      throw new UnauthorizedException('Token expired');
    }

    return payload;
  }

  private verifyPassword(password: string, passwordHash: string) {
    const [salt, storedHash] = passwordHash.split(':');
    if (!salt || !storedHash) return false;

    const computedHash = scryptSync(password, salt, 64).toString('hex');
    if (Buffer.byteLength(computedHash) !== Buffer.byteLength(storedHash)) {
      return false;
    }

    return timingSafeEqual(Buffer.from(computedHash), Buffer.from(storedHash));
  }

  private createSignature(value: string) {
    return createHmac('sha256', this.getAuthSecret())
      .update(value)
      .digest('base64url');
  }

  private toBase64Url(value: string) {
    return Buffer.from(value, 'utf8').toString('base64url');
  }

  private buildExpiryTimestamp() {
    const ttlHours = this.configService.get<number>('AUTH_TOKEN_TTL_HOURS') ?? 168;
    return Date.now() + ttlHours * 60 * 60 * 1000;
  }

  private getAuthSecret() {
    return this.configService.get<string>('AUTH_SECRET') ?? 'change-me-immediately';
  }
}
