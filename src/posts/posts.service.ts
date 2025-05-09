import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { createPostDTO } from './utils/validators/createPostSchema';
import { updatePostDTO } from './utils/validators/updatePostSchema';
import { User, UserRole } from 'src/auth/entities/user.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { FindPostsQueryDto } from './utils/validators/findPostsQuerySchema';
import { PaginatedResposne } from 'src/common/utils/interfaces/paginated-response.interface';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private postListCacheKeys: Set<string> = new Set();

  private generatePostListCacheKey(query: FindPostsQueryDto): string {
    const { page = 1, limit = 10, title } = query;
    return `posts_list_page${page}_limit${limit}_title${title || 'all'}`;
  }
  async findAll(query: FindPostsQueryDto): Promise<PaginatedResposne<Post>> {
    const cacheKey = this.generatePostListCacheKey(query);
    this.postListCacheKeys.add(cacheKey);

    const getCachedData =
      await this.cacheManager.get<PaginatedResposne<Post>>(cacheKey);
    if (getCachedData) {
      console.log(`Cache hit ---> Returning list from Cache ${cacheKey}`);
      return getCachedData;
    }

    const { page = 1, limit = 10, title } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.authorName', 'authorName')
      .orderBy('post.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (title) {
      queryBuilder.andWhere('post.title ILIKE :title', { title: `%${title}%` });
    }

    const [items, totalItems] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);

    const responseResult = {
      items,
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: totalItems,
        totalPages: totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < 1,
      },
    };

    await this.cacheManager.set(cacheKey, responseResult, 30000);

    return responseResult;
  }

  async findOne(id: number): Promise<Post> {
    const singlePost = await this.postRepository.findOne({
      where: { id },
      relations: ['authorName'],
    });
    if (!singlePost) {
      throw new NotFoundException(`Post with ID ${id} is not found`);
    }
    return singlePost;
  }

  async create(createPostData: createPostDTO, user: any): Promise<Post> {
    const { password, ...result } = user;
    const newPost = this.postRepository.create({
      title: createPostData.title,
      content: createPostData.content,
      authorName: result,
    });
    return this.postRepository.save(newPost);
  }

  async update(
    id: number,
    updatePostData: updatePostDTO,
    user: any,
  ): Promise<Post> {
    const findPostToUpdate = await this.findOne(id);
    if (
      findPostToUpdate.authorName.id !== user.id &&
      user.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('You can only update your own posts');
    }
    if (updatePostData.title) {
      findPostToUpdate.title = updatePostData.title;
    }
    if (updatePostData.content) {
      findPostToUpdate.content = updatePostData.content;
    }
    return this.postRepository.save(findPostToUpdate);
  }

  async remove(id: number): Promise<void> {
    const findPostToDelete = await this.findOne(id);
    await this.postRepository.remove(findPostToDelete);
  }
}
