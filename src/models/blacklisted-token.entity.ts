import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'blacklisted_tokens' })
@Index(['token'], { unique: true })
export class BlacklistedToken extends BaseEntity {
  @Column({ type: 'varchar', length: 500 })
  token: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userId: string;
}
