import type { Request, Response } from 'express';
import * as chatService from '../services/chatService.js';

export async function handleChatMessage(req: Request, res: Response): Promise<void> {
  try {
    const { message, location } = req.body as { message?: string; location?: string };

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({
        success: false,
        error: 'A valid "message" string parameter is required',
      });
      return;
    }

    const response = await chatService.processChatQuery(message.trim(), location || 'new-delhi');

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'WeatherGPT inference pipeline error',
    });
  }
}
