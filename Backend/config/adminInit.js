import User from '../models/User.js';

/**
 * Ensures that the default fixed administrator account exists and is active.
 * If the admin user does not exist, it will be automatically created.
 * If it exists, it ensures the role is 'admin', isVerified is true, and status is 'active'.
 */
export const ensureAdminAccount = async () => {
  try {
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin123';

    let adminUser = await User.findOne({ email: adminEmail }).select('+password');
    if (!adminUser) {
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        phone: '+91 9876543210',
        isVerified: true,
        status: 'active'
      });
      console.log(`✅ Fixed Admin Account (${adminEmail}) successfully provisioned.`);
    } else {
      let needsSave = false;
      if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        needsSave = true;
      }
      if (!adminUser.isVerified) {
        adminUser.isVerified = true;
        needsSave = true;
      }
      const isMatch = await adminUser.matchPassword(adminPassword);
      if (!isMatch) {
        adminUser.password = adminPassword;
        needsSave = true;
      }
      if (needsSave) {
        await adminUser.save();
        console.log(`✅ Fixed Admin Account (${adminEmail}) verified with password admin123.`);
      }
    }
  } catch (error) {
    console.error('⚠️ Error ensuring fixed admin account:', error.message);
  }
};
