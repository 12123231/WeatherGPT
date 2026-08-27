import type { Request, Response } from 'express';
import * as weatherService from '../services/weatherService.js';

export async function getCurrentWeather(req: Request, res: Response): Promise<void> {
  try {
    const location = (req.query.location as string) || 'new-delhi';
    const result = await weatherService.getCurrentWeather(location);
    res.json({
      success: true,
      data: result.data,
      isFallback: result.isFallback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal meteorological telemetry failure',
    });
  }
}

export async function getForecast(req: Request, res: Response): Promise<void> {
  try {
    const location = (req.query.location as string) || 'new-delhi';
    const result = await weatherService.getForecast(location);
    res.json({
      success: true,
      data: result.data,
      isFallback: result.isFallback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal forecast projection failure',
    });
  }
}

export async function getHourlyForecast(req: Request, res: Response): Promise<void> {
  try {
    const location = (req.query.location as string) || 'new-delhi';
    const result = await weatherService.getHourlyForecast(location);
    res.json({
      success: true,
      data: result.data,
      isFallback: result.isFallback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve hourly forecast',
    });
  }
}

export async function getWeatherAlerts(req: Request, res: Response): Promise<void> {
  try {
    const location = (req.query.location as string) || 'new-delhi';
    const result = await weatherService.getWeatherRisks(location);
    res.json({
      success: true,
      data: result.data,
      isFallback: result.isFallback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve weather alerts',
    });
  }
}

export async function searchLocations(req: Request, res: Response): Promise<void> {
  try {
    const query = (req.query.q as string) || (req.query.query as string) || '';
    const results = await weatherService.searchLocations(query);
    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Location index lookup failure',
    });
  }
}

export async function getMapData(req: Request, res: Response): Promise<void> {
  try {
    const location = (req.query.location as string) || 'new-delhi';
    const data = await weatherService.getMapData(location);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve map layers',
    });
  }
}
