import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async findAll(@Req() req: any) {
    const events = await this.eventsService.findAll(req.user?.id);
    return { data: events, events };
  }
}
