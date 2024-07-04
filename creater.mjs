import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  const email = 'admin@example.com';
  const username = 'admin';
  const password = 'ComplexPassword123!'; // Используйте сложный пароль
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const adminUser = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role: 1,
      },
    });

    console.log('Admin user created:', adminUser);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
