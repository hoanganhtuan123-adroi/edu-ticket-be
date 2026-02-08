import {
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity as TypeOrmBase,
} from 'typeorm';

export abstract class BaseEntity extends TypeOrmBase {
  @PrimaryColumn({ type: 'uuid', default: () => 'gen_random_uuid()' })
  id: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'now()' })
  updatedAt: Date;
}
