import { Module } from '@nestjs/common';
import { VariantService } from './variant.service';
import { VariantController } from './variant.controller';
import { DatabaseModule } from '@app/common';
import { Variant, VariantSchema } from '@app/common';
import { VariantRepository } from './variant.repository';

@Module({
  imports: [
    DatabaseModule.forFeature([{ name: Variant.name, schema: VariantSchema }]),
  ],
  providers: [VariantService, VariantRepository],
  controllers: [VariantController],
  exports: [VariantService, VariantRepository],
})
export class VariantModule {}
