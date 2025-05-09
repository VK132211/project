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
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { ZodValidationPipe } from './utils/validators/zodValidator';
import {
  createPostDTO,
  createPostSchema,
} from './utils/validators/createPostSchema';
import { Post as PostEntity } from './entities/post.entity';
import {
  updatePostDTO,
  updatePostSchema,
} from './utils/validators/updatePostSchema';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { currentUser } from 'src/auth/decorators/current-user.decorator';

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

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(createPostSchema))
    createPostData: createPostDTO,
    @currentUser() user: any,
  ): Promise<PostEntity> {
    console.log('Received:', createPostData);
    return this.postsService.create(createPostData, user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updatePostSchema)) updatePostData: updatePostDTO,
    @currentUser() user: any,
  ): Promise<PostEntity> {
    return this.postsService.update(id, updatePostData, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.postsService.remove(id);
  }
}
