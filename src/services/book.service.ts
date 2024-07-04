import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateBookDto, UpdateBookDto } from '../types/dto';

@Injectable()
export class BookService {
  constructor(private readonly prisma: PrismaService) {}

  async getBooks() {
    return this.prisma.book.findMany();
  }

  async getBookById(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
    });
    if (!book) {
      throw new BadRequestException('Book not found');
    }
    return book;
  }

  async createBook(createBookDto: CreateBookDto) {
    return this.prisma.book.create({
      data: createBookDto,
    });
  }

  async updateBook(id: number, updateBookDto: UpdateBookDto) {
    const book = await this.prisma.book.findUnique({
      where: { id },
    });
    if (!book) {
      throw new BadRequestException('Book not found');
    }
    return this.prisma.book.update({
      where: { id },
      data: updateBookDto,
    });
  }

  async deleteBook(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
    });
    if (!book) {
      throw new BadRequestException('Book not found');
    }
    return this.prisma.book.delete({
      where: { id },
    });
  }
}
