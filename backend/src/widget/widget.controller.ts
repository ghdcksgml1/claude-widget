import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { WidgetService } from './widget.service';

@Controller('widget')
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Post('stream')
  async streamWidget(
    @Body() body: { prompt: string },
    @Res() res: Response,
  ): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    try {
      for await (const { event, data } of this.widgetService.streamWidget(body.prompt)) {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      res.write(`event: error\ndata: ${JSON.stringify(message)}\n\n`);
    } finally {
      res.end();
    }
  }
}
