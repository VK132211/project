import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UsePipes,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { ZodValidationPipe } from './utils/validators/zodValidator';
import {
  createPostDTO,
  createPostSchema,
} from './utils/validators/createPostSchema';
import { Post as PostEntity } from './entities/post.entity';
import { updatePostDTO } from './utils/validators/updatePostSchema';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async findAll(): Promise<PostEntity[]> {
    return this.postsService.findAll();
  }
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PostEntity> {
    return this.postsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(createPostSchema))
  async create(@Body() createPostData: createPostDTO): Promise<PostEntity> {
    return this.postsService.create(createPostData);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostData: updatePostDTO,
  ): Promise<PostEntity> {
    return this.postsService.update(id, updatePostData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.postsService.remove(id);
  }
}
