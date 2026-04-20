import { db } from '../lib/db.js';
import { users } from '../schemas/db/index.js';
import * as argon2 from 'argon2';

async function seed() {
  console.log('🌱 Starting DB seed...');

  try {
    const passwordHash = await argon2.hash('Password123!', {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    // 1. Admin
    await db.insert(users).values({
      email: 'admin@helixonix.com',
      username: 'admin',
      displayName: 'System Admin',
      passwordHash,
      role: 'super_admin',
      status: 'active',
      emailVerified: true,
    }).onConflictDoNothing();

    // 2. Seller
    await db.insert(users).values({
      email: 'seller@helixonix.com',
      username: 'top_seller',
      displayName: 'Top Creator',
      passwordHash,
      role: 'seller',
      status: 'active',
      emailVerified: true,
      sellerLevel: 'level_2',
    }).onConflictDoNothing();

    // 3. Buyer
    await db.insert(users).values({
      email: 'buyer@helixonix.com',
      username: 'awesome_buyer',
      displayName: 'Awesome Buyer',
      passwordHash,
      role: 'buyer',
      status: 'active',
      emailVerified: true,
    }).onConflictDoNothing();

    console.log('✅ Seed completed successfully. Users created:');
    console.log('   - admin@helixonix.com / Password123!');
    console.log('   - seller@helixonix.com / Password123!');
    console.log('   - buyer@helixonix.com / Password123!');
  } catch (err) {
    console.error('❌ Seed failed:', err);
  } finally {
    process.exit(0);
  }
}

seed();
