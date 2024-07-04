import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { User, CheckUser } from '../types/dto';
import * as bcrypt from 'bcryptjs';
import { MailerService } from '@nestjs-modules/mailer';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
  ) {}

  private pendingUsers = {};

  async getUserById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async confirmEmail(user: User) {
    const { email, username, password } = user;
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      throw new BadRequestException('Username or email already exists');
    }

    const confirmationToken = uuidv4();
    this.pendingUsers[confirmationToken] = { email, username, password };

    const url = `http://localhost:3000/users/confirm-email?tokken=${confirmationToken}&username=${username}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Email Confirmation',
      text: `Please confirm your email by clicking the following link: ${url}`,
      html: `Please confirm your email by clicking the following link: <a href="${url}">${url}</a>`,
    });

    return {
      message:
        'Confirmation email sent. Please confirm your email to complete the registration.',
    };
  }

  async createUser(token: string, username: string) {
    const pendingUser = this.pendingUsers[token];

    if (!pendingUser || pendingUser.username !== username) {
      throw new BadRequestException('Invalid or expired token');
    }

    const { email, password } = pendingUser;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
      },
    });

    delete this.pendingUsers[token];

    return user;
  }

  async checkUser(creds: CheckUser) {
    const { username, password } = creds;

    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new BadRequestException('user not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    const payload = { userId: user.id, role: user.role };
    const token = this.jwtService.sign(payload);

    return token;
  }
  async changeUserRole(id: number, role: 0 | 1) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { role },
    });

    return updatedUser;
  }
}
