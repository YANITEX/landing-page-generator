const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
  
  try {
    const prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
    
    console.log('Attempting to connect...');
    await prisma.$connect();
    console.log('✅ Connected successfully!');
    
    console.log('Testing simple query...');
    const count = await prisma.landingPage.count();
    console.log('✅ Query successful! Landing pages count:', count);
    
    await prisma.$disconnect();
    console.log('✅ Disconnected successfully');
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testConnection();
