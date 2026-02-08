import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountDto } from './create.dto';

export class UpdateAccountDto extends PartialType(CreateAccountDto) {}
