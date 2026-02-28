import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';
import { LoginDto } from './dto/login.dto';
import { comparePassword } from './password.util';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private adminRepo: Repository<Admin>,
    private jwtService: JwtService,
  ) {}

  async validateAdmin(email: string, password: string): Promise<Admin | null> {
    const admin = await this.adminRepo.findOne({ where: { email: email.toLowerCase() } });
    if (admin && (await comparePassword(password, admin.passwordHash))) {
      return admin;
    }
    return null;
  }

  async login(dto: LoginDto) {
    const admin = await this.validateAdmin(dto.email, dto.password);
    if (!admin) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const payload = { sub: admin.id, email: admin.email };
    return {
      access_token: this.jwtService.sign(payload),
      admin: { id: admin.id, email: admin.email },
    };
  }

  async findById(id: string): Promise<Admin | null> {
    return this.adminRepo.findOne({ where: { id } });
  }
}
