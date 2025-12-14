/**
 * Create Admin User Script
 * Creates a default admin user for Finance API authentication
 *
 * Usage: node src/backend/scripts/create-admin-user.js
 *
 * @version 2.0.0
 */

import { createDirectus, rest, staticToken, readItems, createItem, updateItem } from '@directus/sdk';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;

// Default admin user configuration
const ADMIN_USER = {
  email: 'admin@directus.io',
  password: 'admin123',
  first_name: 'Admin',
  last_name: 'User',
  role: 'admin',
  companies: ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI_REALTY', 'TAKEOUT'],
  permissions: ['*.*'],
  status: 'active'
};

const getDirectus = () => {
  return createDirectus(DIRECTUS_URL)
    .with(staticToken(DIRECTUS_TOKEN))
    .with(rest());
};

async function createAdminUser() {
  console.log('\n🔐 Creating Admin User for Finance API...\n');

  const directus = getDirectus();

  try {
    // Check if finance_users collection exists
    console.log('Checking finance_users collection...');

    // Check if user already exists
    let existingUsers = [];
    try {
      existingUsers = await directus.request(
        readItems('finance_users', {
          filter: { email: { _eq: ADMIN_USER.email } },
          limit: 1
        })
      );
    } catch (e) {
      console.log('⚠️  finance_users collection may not exist. Run migration first:');
      console.log('   node src/backend/migrations/005_company_configs.js\n');
      return;
    }

    if (existingUsers.length > 0) {
      console.log('ℹ️  Admin user already exists, updating...');

      // Hash password
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(ADMIN_USER.password, salt);

      await directus.request(
        updateItem('finance_users', existingUsers[0].id, {
          password: passwordHash,
          first_name: ADMIN_USER.first_name,
          last_name: ADMIN_USER.last_name,
          role: ADMIN_USER.role,
          companies: ADMIN_USER.companies,
          permissions: ADMIN_USER.permissions,
          status: ADMIN_USER.status
        })
      );

      console.log('✅ Admin user updated successfully!\n');
    } else {
      // Hash password
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(ADMIN_USER.password, salt);

      // Create new admin user
      await directus.request(
        createItem('finance_users', {
          email: ADMIN_USER.email,
          password: passwordHash,
          first_name: ADMIN_USER.first_name,
          last_name: ADMIN_USER.last_name,
          role: ADMIN_USER.role,
          companies: ADMIN_USER.companies,
          permissions: ADMIN_USER.permissions,
          status: ADMIN_USER.status,
          date_created: new Date().toISOString()
        })
      );

      console.log('✅ Admin user created successfully!\n');
    }

    console.log('📋 Login Credentials:');
    console.log('   Email:    ', ADMIN_USER.email);
    console.log('   Password: ', ADMIN_USER.password);
    console.log('\n🔗 Login URL: http://localhost:3000/superadmin');
    console.log('🔗 API Auth:  http://localhost:3000/api/auth/login');
    console.log('\n⚠️  Remember to change the password in production!\n');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.errors) {
      console.error('   Details:', error.errors);
    }
  }
}

// Also create a test regular user
async function createTestUser() {
  console.log('Creating test user...');

  const directus = getDirectus();

  const TEST_USER = {
    email: 'user@test.com',
    password: 'user123',
    first_name: 'Test',
    last_name: 'User',
    role: 'user',
    companies: ['HYPERVISUAL'],
    permissions: ['finance.read'],
    status: 'active'
  };

  try {
    // Check if user exists
    const existing = await directus.request(
      readItems('finance_users', {
        filter: { email: { _eq: TEST_USER.email } },
        limit: 1
      })
    );

    if (existing.length > 0) {
      console.log('ℹ️  Test user already exists');
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(TEST_USER.password, salt);

    await directus.request(
      createItem('finance_users', {
        ...TEST_USER,
        password: passwordHash,
        date_created: new Date().toISOString()
      })
    );

    console.log('✅ Test user created: user@test.com / user123');

  } catch (error) {
    console.warn('⚠️  Could not create test user:', error.message);
  }
}

async function main() {
  await createAdminUser();
  await createTestUser();
}

main().catch(console.error);

export { createAdminUser, createTestUser };
