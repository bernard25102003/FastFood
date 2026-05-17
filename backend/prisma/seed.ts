import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ─── Admin user ──────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@food.com' },
    update: {},
    create: {
      email: 'admin@food.com',
      password: adminPassword,
      name: 'Quản Trị Viên',
      phone: '0901234567',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // ─── Sample users ─────────────────────────────────────────────────────────
  const users = [];
  for (let i = 1; i <= 3; i++) {
    const userPassword = await bcrypt.hash('User@123', 12);
    const user = await prisma.user.upsert({
      where: { email: `user${i}@mem.com` },
      update: {},
      create: {
        email: `user${i}@mem.com`,
        password: userPassword,
        name: `Khách Hàng ${i}`,
        phone: `090${1234567 + i}`,
        address: `${100 + i} Đường Nguyễn Huệ, Quận 1, TP.HCM`,
        role: 'USER',
        status: 'ACTIVE',
      },
    });
    users.push(user);
    console.log(`✅ User created: ${user.email}`);
  }

  // ─── Fast Food Categories ─────────────────────────────────────────────────
  const categories = [];
  const categoryData = [
    { name: 'Burgers', description: 'Bánh mì kẹp thơm ngon', icon: '🍔' },
    { name: 'Pizza', description: 'Pizza nướng đặc biệt', icon: '🍕' },
    { name: 'Chicken', description: 'Gà rán giòn ngon', icon: '🍗' },
    { name: 'Drinks', description: 'Thức uống mát lạnh', icon: '🥤' },
    { name: 'Sides', description: 'Đồ ăn kèm', icon: '🍟' },
    { name: 'Desserts', description: 'Tráng miệng ngon miệng', icon: '🍰' },
  ];

  for (const cat of categoryData) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
      },
    });
    categories.push(category);
  }
  console.log(`✅ ${categories.length} categories created`);

  // ─── Fast Food Products ───────────────────────────────────────────────────
  const products = [];
  const productsData = [
    {
      category: 'Burgers',
      name: 'Burger Bò Phô Mai',
      description: 'Bánh mì kẹp với thịt bò tươi, phô mai cheddar, rau xà lách, cà chua',
      price: 45000,
    },
    {
      category: 'Burgers',
      name: 'Burger Gà Nướng',
      description: 'Thịt gà nướng nước sốt BBQ, phô mai, hành tây caramel',
      price: 42000,
    },
    {
      category: 'Burgers',
      name: 'Burger Đôi',
      description: 'Hai miếng thịt bò, phô mai đôi, bácon giòn',
      price: 65000,
    },
    {
      category: 'Pizza',
      name: 'Pizza Margherita',
      description: 'Pizza cơ bản với cà chua, phô mai mozzarella, lá húng quế',
      price: 65000,
    },
    {
      category: 'Pizza',
      name: 'Pizza Pepperoni',
      description: 'Pizza với xúc xích pepperoni, phô mai mozzarella, cà chua',
      price: 75000,
    },
    {
      category: 'Pizza',
      name: 'Pizza Hải Sản',
      description: 'Pizza với tôm, mực, cua, nấm, hành',
      price: 95000,
    },
    {
      category: 'Chicken',
      name: 'Gà Rán 3 Miếng',
      description: 'Gà rán giòn ngoài, mềm trong, ăn kèm tương ớt',
      price: 55000,
    },
    {
      category: 'Chicken',
      name: 'Gà Rán 6 Miếng',
      description: 'Gà rán giòn ngoài, mềm trong, ăn kèm tương ớt',
      price: 95000,
    },
    {
      category: 'Chicken',
      name: 'Cánh Gà Nước Mắm',
      description: 'Cánh gà nướng nước mắm, tỏi ớt',
      price: 45000,
    },
    {
      category: 'Sides',
      name: 'Khoai Tây Chiên',
      description: 'Khoai tây chiên giòn, ăn kèm muối và tương',
      price: 25000,
    },
    {
      category: 'Sides',
      name: 'Gà Nugggets',
      description: '8 miếng gà nuggets giòn, ăn kèm tương cà chua',
      price: 35000,
    },
    {
      category: 'Sides',
      name: 'Mozzarella Que',
      description: '6 que phô mai chiên, ăn kèm sốt cà chua',
      price: 40000,
    },
    {
      category: 'Drinks',
      name: 'Nước Ngọt (330ml)',
      description: 'Coca, Sprite, Fanta các vị',
      price: 12000,
    },
    {
      category: 'Drinks',
      name: 'Nước Cam Tươi',
      description: 'Nước cam tươi vắt từ cam ngọt',
      price: 18000,
    },
    {
      category: 'Drinks',
      name: 'Bia Lạnh',
      description: 'Bia Heineken, Tiger, Saigon lạnh mát',
      price: 25000,
    },
    {
      category: 'Desserts',
      name: 'Kem Vani',
      description: 'Kem vani mịn, lạnh, ăn với bánh waffle',
      price: 20000,
    },
    {
      category: 'Desserts',
      name: 'Bánh Kem Sô Cô La',
      description: 'Bánh kem sô cô la ngon, lạnh',
      price: 35000,
    },
    {
      category: 'Desserts',
      name: 'Bánh Donut',
      description: 'Bánh donut mềm, phủ đường hoặc sô cô la',
      price: 15000,
    },
  ];

  for (const prod of productsData) {
    const category = categories.find((c) => c.name === prod.category);
    if (category) {
      // Check if product exists, if not create it
      let product = await prisma.product.findFirst({
        where: { name: prod.name },
      });
      if (!product) {
        product = await prisma.product.create({
          data: {
            name: prod.name,
            description: prod.description,
            price: prod.price,
            categoryId: category.id,
          },
        });
      }
      products.push(product);
    }
  }
  console.log(`✅ ${products.length} products created`);

  // ─── Orders with Order Items ──────────────────────────────────────────────
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const user = users[i % users.length];
    const orderNumber = `ORD-${Date.now()}-${i}`;
    const randomProducts = products.sort(() => Math.random() - 0.5).slice(0, 3);
    let totalPrice = 0;

    const items = randomProducts.map((p) => {
      const qty = Math.floor(Math.random() * 3) + 1;
      const price = typeof p.price === 'number' ? p.price : parseFloat(p.price.toString());
      return {
        productId: p.id,
        productName: p.name,
        productPrice: p.price,
        quantity: qty,
        subtotal: price * qty,
      };
    });

    totalPrice = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

    await prisma.order.create({
      data: {
        userId: user.id,
        orderNumber,
        status: i < 2 ? 'COMPLETED' : i === 2 ? 'SHIPPING' : 'CONFIRMED',
        totalPrice,
        paymentMethod: Math.random() > 0.5 ? 'COD' : 'BANK_TRANSFER',
        recipientName: user.name,
        recipientPhone: user.phone || '0901234567',
        recipientAddress: user.address || 'TP.HCM',
        notes: `Đơn hàng ${i + 1}`,
        confirmedAt: new Date(today.getTime() - i * 86400000),
        completedAt: i < 2 ? new Date(today.getTime() - i * 86400000) : null,
        items: {
          create: items,
        },
      },
    });

    // Update product soldCount
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { soldCount: { increment: item.quantity } },
      });
    }
  }
  console.log(`✅ Orders and Order Items created`);

  // ─── Reviews ──────────────────────────────────────────────────────────────
  for (let i = 0; i < products.length && i < 10; i++) {
    const product = products[i];
    const user = users[i % users.length];
    const rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars

    await prisma.review.upsert({
      where: {
        productId_userId: {
          productId: product.id,
          userId: user.id,
        },
      },
      update: {},
      create: {
        productId: product.id,
        userId: user.id,
        rating,
        title: `${['Tuyệt vời!', 'Rất ngon', 'Đáng mua', 'Chất lượng tốt'][Math.floor(Math.random() * 4)]}`,
        content: [
          'Sản phẩm rất ngon, delivery nhanh chóng.',
          'Chất lượng tốt, giá cả hợp lý.',
          'Tôi rất thích sản phẩm này, sẽ mua lại.',
          'Tuyệt vời, giao hàng đúng giờ.',
          'Hài lòng với chất lượng và dịch vụ.',
        ][Math.floor(Math.random() * 5)],
        verified: true,
      },
    });
  }
  console.log(`✅ Reviews created`);

  // ─── Update product ratings ───────────────────────────────────────────────
  for (const product of products) {
    const reviews = await prisma.review.findMany({
      where: { productId: product.id },
    });
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      const roundedRating = Math.round(avgRating * 100) / 100;
      await prisma.product.update({
        where: { id: product.id },
        data: {
          avgRating: roundedRating,
          reviewCount: reviews.length,
        },
      });
    }
  }
  console.log(`✅ Product ratings updated`);

  console.log('\n🎉 Seed completed successfully!');
  console.log('─'.repeat(60));
  console.log('📧 Admin: admin@ecommerce.com / Admin@123456');
  console.log('📧 User:  user1@example.com / User@123456');
  console.log('📧 User:  user2@example.com / User@123456');
  console.log('📧 User:  user3@example.com / User@123456');
  console.log('─'.repeat(60));
  console.log('🍔 Fast Food Restaurant Seed Data:');
  console.log(`   - 6 Categories (Burgers, Pizza, Chicken, Drinks, Sides, Desserts)`);
  console.log(`   - 18 Products`);
  console.log(`   - 5 Orders with Order Items`);
  console.log(`   - 10 Reviews`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
