import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      username: 'administrator',
      email: 'admin@example.com',
      password: '$2a$10$Q/ChcXXpnLYfobG0ekhQFeRcmPvQnTWZkb7aUgemXlxACouJ7PzCm', //ComplexPassword123!
      role: 1,
    },
  });

  console.log({ admin });

  const books = [];
  for (let i = 1; i <= 100; i++) {
    books.push({
      title: `Book Title ${i}`,
      author: `Author ${i}`,
      publicationDate: new Date(),
      genres: ['fiction', 'adventure'],
    });
  }

  await prisma.book.createMany({
    data: books,
  });

  console.log('Books have been created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
