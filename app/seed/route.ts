import bcrypt from 'bcrypt';
import { db } from '@vercel/postgres';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

async function seedUsers() {
  try {
    const client = await db.connect();
  
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await client.sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `;
  
    const insertedUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return client.sql`
          INSERT INTO users (id, name, email, password)
          VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
          ON CONFLICT (id) DO NOTHING;
        `;
      }),
    );
  
    return insertedUsers;
  } catch (error) {
    console.log(`Error seeding users: ${error}`);
    
  }
}

async function seedInvoices() {
 try {
     const client = await db.connect();
   
     await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
   
     await client.sql`
       CREATE TABLE IF NOT EXISTS invoices (
         id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
         customer_id UUID NOT NULL,
         amount INT NOT NULL,
         status VARCHAR(255) NOT NULL,
         date DATE NOT NULL
       );
     `;
   
     const insertedInvoices = await Promise.all(
       invoices.map(
         (invoice) => client.sql`
           INSERT INTO invoices (customer_id, amount, status, date)
           VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
           ON CONFLICT (id) DO NOTHING;
         `,
       ),
     );
   
     return insertedInvoices;
 } catch (error) {
    console.log(`Error seeding invoices: ${error}`);
    
 }
}

async function seedCustomers() {
 try {
     const client = await db.connect();
   
     await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
   
     await client.sql`
       CREATE TABLE IF NOT EXISTS customers (
         id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
         name VARCHAR(255) NOT NULL,
         email VARCHAR(255) NOT NULL,
         image_url VARCHAR(255) NOT NULL
       );
     `;
   
     const insertedCustomers = await Promise.all(
       customers.map(
         (customer) => client.sql`
           INSERT INTO customers (id, name, email, image_url)
           VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
           ON CONFLICT (id) DO NOTHING;
         `,
       ),
     );
   
     return insertedCustomers;
 } catch (error) {
    console.log(`Error seeding customers: ${error}`);
    
 }
}

async function seedRevenue() {
 try {
     const client = await db.connect();
   
     await client.sql`
       CREATE TABLE IF NOT EXISTS revenue (
         month VARCHAR(4) NOT NULL UNIQUE,
         revenue INT NOT NULL
       );
     `;
   
     const insertedRevenue = await Promise.all(
       revenue.map(
         (rev) => client.sql`
           INSERT INTO revenue (month, revenue)
           VALUES (${rev.month}, ${rev.revenue})
           ON CONFLICT (month) DO NOTHING;
         `,
       ),
     );
   
     return insertedRevenue;
 } catch (error) {
    console.log(`Error seeding revenue: ${error}`);
    
 }
}

export async function GET() {
  const client = await db.connect();

  try {
    await client.sql`BEGIN`;
    await seedUsers();
    await seedCustomers();
    await seedInvoices();
    await seedRevenue();
    await client.sql`COMMIT`;

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    await client.sql`ROLLBACK`;
    return Response.json({ error, message: 'Error seeding database' }, { status: 500 });
  }
}
