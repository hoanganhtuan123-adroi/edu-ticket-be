import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'audit_logs' })
@Index(['targetTable', 'targetId'])
@Index(['createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  performerId: string;

  @Column({ type: 'varchar', length: 50 })
  action: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  targetTable: string;

  @Column({ type: 'uuid', nullable: true })
  targetId: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValue: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  newValue: Record<string, any>;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.auditLogs, { nullable: false })
  @JoinColumn({ name: 'performer_id' })
  performer: User;
}
