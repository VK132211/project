import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    console.log('📦 ZodValidationPipe received:', value); // <-- DEBUG log

    const result = this.schema.safeParse(value);

    if (!result.success) {
      console.error('❌ Zod validation errors:', result.error.format());
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.format(),
      });
    }

    return result.data;
  }
}
