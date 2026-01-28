const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.error('Usage: node scripts/create-superuser.js <email> <password>');
        process.exit(1);
    }

    const email = args[0];
    const password = args[1];

    console.log(`Setting up superuser for email: ${email}`);

    // 1. Ensure SuperAdmin Role Exists
    let superAdminRole = await prisma.role.findUnique({
        where: { name: 'SuperAdmin' },
    });

    if (!superAdminRole) {
        console.log('SuperAdmin role not found. Creating it...');
        superAdminRole = await prisma.role.create({
            data: {
                name: 'SuperAdmin',
                description: 'Super Administrator with full system access',
                level: 'SUPER_ADMIN',
                isSystem: true,
            },
        });
        console.log('SuperAdmin role created.');
    }

    // 2. Hash Password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Find or Create User
    let user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        console.log('User not found. Creating new user...');
        user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                status: 'ACTIVE',
                emailVerified: true,
            },
        });
        console.log(`User created with ID: ${user.id}`);
    } else {
        // Optional: Update password if user exists?
        // For now, checks if user exists and proceeds to make them admin.
        console.log(`User already exists (ID: ${user.id}). Promoting to SuperAdmin...`);
        // Consider updating password here if requested, but requirement just said "Checks / Creates".
        // We will ensure user is ACTIVE and Verified though.
        if (user.status !== 'ACTIVE' || !user.emailVerified) {
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    status: 'ACTIVE',
                    emailVerified: true,
                }
            });
            console.log('User activated and verified.');
        }
    }

    // 4. Assign Role
    const existingUserRole = await prisma.userRole.findUnique({
        where: {
            userId_roleId: {
                userId: user.id,
                roleId: superAdminRole.id,
            },
        },
    });

    if (!existingUserRole) {
        await prisma.userRole.create({
            data: {
                userId: user.id,
                roleId: superAdminRole.id,
            },
        });
        console.log('Assigned SuperAdmin role to user.');
    } else {
        console.log('User already has SuperAdmin role.');
    }

    // 5. Create Admin Record
    let admin = await prisma.admin.findUnique({
        where: { userId: user.id },
    });

    if (!admin) {
        admin = await prisma.admin.create({
            data: {
                userId: user.id,
                adminLevel: 'SUPER_ADMIN',
                notes: 'Created via create-superuser script',
            },
        });
        console.log('Admin profile created.');
    } else {
        // Ensure admin level matches
        if (admin.adminLevel !== 'SUPER_ADMIN') {
            admin = await prisma.admin.update({
                where: { id: admin.id },
                data: { adminLevel: 'SUPER_ADMIN' }
            });
            console.log('Updated existing Admin profile level to SUPER_ADMIN.');
        }
    }

    // 6. Create SuperAdmin Record
    let superAdmin = await prisma.superAdmin.findUnique({
        where: { adminId: admin.id },
    });

    if (!superAdmin) {
        await prisma.superAdmin.create({
            data: {
                adminId: admin.id,
            },
        });
        console.log('SuperAdmin profile created.');
    } else {
        console.log('SuperAdmin profile already exists.');
    }

    console.log('Superuser setup complete successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
