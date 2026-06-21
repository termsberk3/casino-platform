import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FavoritesService } from './favorites.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Favorites')
@ApiBearerAuth('access-token')
@Controller()
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('games/:id/favorite')
  @ApiOperation({
    summary: 'Add game to current user favorites',
  })
  @ApiParam({
    name: 'id',
    example: '1',
  })
  addFavorite(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') gameId: string,
  ) {
    return this.favoritesService.addFavorite(user.id, gameId);
  }

  @Delete('games/:id/favorite')
  @ApiOperation({
    summary: 'Remove game from current user favorites',
  })
  @ApiParam({
    name: 'id',
    example: '1',
  })
  removeFavorite(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') gameId: string,
  ) {
    return this.favoritesService.removeFavorite(user.id, gameId);
  }

  @Get('users/me/favorites')
  @ApiOperation({
    summary: 'List current user favorite games',
  })
  findMyFavorites(@CurrentUser() user: AuthenticatedUser): Promise<any> {
    return this.favoritesService.findMyFavorites(user.id);
  }
}
