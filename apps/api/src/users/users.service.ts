import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from './entities/user.entity';

interface CreateUserInput {
  email: string;
  passwordHash: string;
  displayName?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(input: CreateUserInput): Promise<UserEntity> {
    const normalizedEmail = input.email.trim().toLowerCase();

    const existingUser = await this.userRepository.findOne({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const user = this.userRepository.create({
      email: normalizedEmail,
      passwordHash: input.passwordHash,
      displayName: input.displayName?.trim() || null,
      balance: '20.00',
    });

    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: {
        email: email.trim().toLowerCase(),
      },
    });
  }

  async findById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('User could not be found');
    }

    return user;
  }
}
