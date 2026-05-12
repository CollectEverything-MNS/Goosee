import { Module } from '@nestjs/common';
import { SharedSecurityModule } from '../../shared/shared-security.module';
import { CreateTagController } from './usecases/create-tag/create-tag.controller';
import { DeleteTagController } from './usecases/delete-tag/delete-tag.controller';
import { GetTagController } from './usecases/get-tag/get-tag.controller';
import { ListTagsController } from './usecases/list-tags/list-tags.controller';

@Module({
  imports: [SharedSecurityModule],
  controllers: [ListTagsController, GetTagController, CreateTagController, DeleteTagController],
})
export class TagsModule {}
