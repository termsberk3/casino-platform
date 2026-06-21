import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSpinDto } from './dto/create-spin.dto';
import { SpinsService } from './spins.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Spins')
@ApiBearerAuth('access-token')
@Controller('spins')
@UseGuards(JwtAuthGuard)
export class SpinsController {
  constructor(private readonly spinsService: SpinsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a slot spin transaction',
  })
  createSpin(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateSpinDto,
  ): Promise<any> {
    return this.spinsService.createSpin(user.id, dto);
  }

  @Get('history')
  @ApiOperation({
    summary: 'List current user spin history',
  })
  findMyHistory(@CurrentUser() user: AuthenticatedUser): Promise<any> {
    return this.spinsService.findMyHistory(user.id);
  }
}
