import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  Req,
  UnauthorizedException,
  ParseIntPipe,
} from '@nestjs/common';
import { BookService } from './services/book.service';
import { AuthService } from './services/auth.service';
import { CreateBookDto, UpdateBookDto } from './types/dto';
import { Request } from 'express';

@Controller('books')
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  async getBooks() {
    return this.bookService.getBooks();
  }

  @Get(':id')
  async getBookById(@Param('id', ParseIntPipe) id: number) {
    return this.bookService.getBookById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createBook(@Body() createBookDto: CreateBookDto, @Req() req: Request) {
    let decoded: any;
    try {
      decoded = this.authService.authenticate(req);
    } catch (err) {
      throw new UnauthorizedException(err.message);
    }

    if (decoded.role !== 1) {
      throw new UnauthorizedException('Only administrators can add books');
    }

    return this.bookService.createBook(createBookDto);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateBook(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDto: UpdateBookDto,
    @Req() req: Request,
  ) {
    let decoded: any;
    try {
      decoded = this.authService.authenticate(req);
    } catch (err) {
      throw new UnauthorizedException(err.message);
    }

    if (decoded.role !== 1) {
      throw new UnauthorizedException('Only administrators can update books');
    }

    return this.bookService.updateBook(id, updateBookDto);
  }

  @Delete(':id')
  async deleteBook(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    let decoded: any;
    try {
      decoded = this.authService.authenticate(req);
    } catch (err) {
      throw new UnauthorizedException(err.message);
    }

    if (decoded.role !== 1) {
      throw new UnauthorizedException('Only administrators can delete books');
    }

    return this.bookService.deleteBook(id);
  }
}
