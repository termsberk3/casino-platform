import { Controller, Get, Param, Query } from '@nestjs/common';

import { ListGamesQueryDto } from './dto/list-games-query.dto';
import { SearchGamesQueryDto } from './dto/search-games-query.dto';
import { GamesService } from './games.service';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Games')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  @ApiOperation({
    summary: 'List active games',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 20,
  })
  @ApiQuery({
    name: 'provider',
    required: false,
    example: 'BGaming',
  })
  findAll(@Query() query: ListGamesQueryDto): Promise<any> {
    return this.gamesService.findAll(query);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search active games by name, slug or provider',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    example: 'fire',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 20,
  })
  @ApiOperation({
    summary: 'Search for games',
  })
  search(@Query() query: SearchGamesQueryDto): Promise<any> {
    return this.gamesService.search(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get game by id',
  })
  @ApiParam({
    name: 'id',
    example: '1',
  })
  findOne(@Param('id') id: string) {
    return this.gamesService.findOne(id);
  }
}
