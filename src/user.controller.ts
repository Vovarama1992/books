import {
  Controller,
  Get,
  Put,
  Post,
  Query,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  Res,
  Req,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import { CheckUser, User } from './types/dto';
import { Response } from 'express';
import { Request } from 'express';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}
  @Get()
  async hellower() {
    return 'llo';
  }

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async confirmEmail(@Body() user: User) {
    return this.userService.confirmEmail(user);
  }

  @Get('confirm-email')
  async createUser(
    @Query('tokken') tokken: string,
    @Query('username') username: string,
    @Res() res: Response,
  ) {
    if (!tokken || !username) {
      throw new BadRequestException('Token and username are required');
    }

    await this.userService.createUser(tokken, username);

    return res.json({ message: 'User created successfully' });
  }

  @Get(':id')
  async getUserById(@Param('id') id: number, @Req() req: Request) {
    let decoded: number;
    try {
      decoded = this.authService.authenticate(req);
      console.log(decoded);
    } catch (err) {
      throw new UnauthorizedException(err.message);
    }

    const user = await this.userService.getUserById(Number(id));
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }
  @Put(':id')
  async changeRole(
    @Param('id') id: number,
    @Body('role') role: 0 | 1,
    @Req() req: Request,
  ) {
    let decoded: any;
    try {
      decoded = this.authService.authenticate(req);
    } catch (err) {
      throw new UnauthorizedException(err.message);
    }

    if (decoded.role !== 1) {
      throw new UnauthorizedException('Only administrators can change roles');
    }

    try {
      const updatedUser = await this.userService.changeUserRole(id, role);
      return updatedUser;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async checkUser(@Body() user: CheckUser) {
    try {
      const res = await this.userService.checkUser(user);
      return res;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
