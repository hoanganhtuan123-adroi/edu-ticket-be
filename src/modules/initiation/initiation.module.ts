import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { SystemRole } from '../../models/enums';

@Module({
  imports: [UserModule],
})
export class InitiationModule implements OnApplicationBootstrap {
  constructor(
    private readonly userService: UserService,
  ) {}
  async onApplicationBootstrap() {
    await this.createDefaultAdmin();
  }

  private async createDefaultAdmin() {
    try {
      const adminEmail =  'admin@event.com';
      const adminPassword =  'admin123';
      const adminFullName =  'System Administrator';

      // Check if admin already exists
      const existingAdmin = await this.userService.findByEmail(adminEmail);
      if (existingAdmin) {
        console.log('Admin account already exists');
        return;
      }

      // Create admin account
      await this.userService.createDefaultAccount({
        password: adminPassword,
        email: adminEmail,
        fullname: adminFullName,
        role: SystemRole.ADMIN,
      });

      console.log('Default admin account created successfully');
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
    } catch (error) {
      console.error('Error creating default admin account:', error);
    }
  }
}
