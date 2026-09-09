import type { CurrentWeather, HourlyForecast, ForecastDay } from '../types/weather';

export type ActivityCategory = 'Favorable' | 'Cautious' | 'Unfavorable';

export interface ActivityAdvice {
  score: number; // 0 - 100
  category: ActivityCategory;
  explanation: string;
}

export interface KeyWindow {
  type: 'outdoor' | 'rain' | 'heat' | 'uv';
  label: string;
  timeRange: string;
  detail: string;
}

export interface WeatherInsightResult {
  dataAvailable: boolean;
  locationName: string;
  dailySummary: string;
  activityAdvice: ActivityAdvice;
  clothingAdvice: string[];
  keyWindows: KeyWindow[];
}

/**
 * Deterministic Meteorological Intelligence Engine.
 * 
 * Generates user-facing insights, recommendations, and windows using ONLY verified
 * live telemetry already in memory. Zero external LLM calls. Zero hallucination risk.
 */
export function generateWeatherInsights(
  locationName: string,
  currentWeather: CurrentWeather | null,
  hourlyForecast: HourlyForecast[],
  forecast: ForecastDay[],
  isLive: boolean,
): WeatherInsightResult {
  // Strict Live Data Enforcement
  if (!currentWeather || !isLive) {
    return {
      dataAvailable: false,
      locationName,
      dailySummary: 'AI Weather Insights unavailable � Live weather data offline.',
      activityAdvice: {
        score: 0,
        category: 'Unfavorable',
        explanation: 'Live weather telemetry offline.',
      },
      clothingAdvice: [],
      keyWindows: [],
    };
  }

  const targetLocation = currentWeather.location || locationName;
  const todayForecast = forecast && forecast.length > 0 ? forecast[0] : null;
  const highTemp = todayForecast?.high ?? currentWeather.temperature;
  const lowTemp = todayForecast?.low ?? currentWeather.temperature;
  const currentTemp = currentWeather.temperature;
  const conditionMain = currentWeather.condition.main;
  const windSpeed = currentWeather.windSpeed ?? 0;
  const humidity = currentWeather.humidity ?? 0;
  const uvIndex = currentWeather.uvIndex ?? 0;

  // Next 12 hours timeline (slice up to 12 hours)
  const next12Hours = (hourlyForecast || []).slice(0, 13);

  // ----------------------------------------------------
  // A. dailySummary: Concise Plain-Language Weather Summary
  // ----------------------------------------------------
  const maxRainProbIn12h = next12Hours.reduce(
    (max, h) => Math.max(max, h.rainProbability ?? 0),
    0
  );
  const maxPrecipIn12h = next12Hours.reduce(
    (max, h) => Math.max(max, h.precipitation ?? 0),
    0
  );

  let rainSentence = '';
  if (maxRainProbIn12h >= 60 || maxPrecipIn12h >= 2) {
    rainSentence = `Rain is likely during the day with up to ${maxRainProbIn12h}% precipitation chance.`;
  } else if (maxRainProbIn12h >= 30) {
    rainSentence = `Passing showers are possible with a ${maxRainProbIn12h}% rain probability.`;
  } else {
    rainSentence = 'Low chance of rain throughout the day.';
  }

  let tempSentence = '';
  if (highTemp >= 40) {
    tempSentence = `Extreme heat today reaching up to ${highTemp}�C.`;
  } else if (highTemp >= 33) {
    tempSentence = `Warm conditions expected today with a high of ${highTemp}�C (low ${lowTemp}�C).`;
  } else if (highTemp <= 15) {
    tempSentence = `Chilly weather persisting with a high of ${highTemp}�C and overnight lows near ${lowTemp}�C.`;
  } else {
    tempSentence = `Comfortable temperatures expected, reaching ${highTemp}�C with lows near ${lowTemp}�C.`;
  }

  const dailySummary = `${conditionMain} in ${targetLocation} at ${currentTemp}�C. ${tempSentence} ${rainSentence}`;

  // ----------------------------------------------------
  // B. activityAdvice: Outdoor Activity Score (0 - 100)
  // ----------------------------------------------------
  let score = 100;
  const deductions: string[] = [];

  // Temperature penalization
  if (currentTemp > 38) {
    score -= 35;
    deductions.push('intense heat');
  } else if (currentTemp > 33) {
    score -= 20;
    deductions.push('high heat');
  } else if (currentTemp < 5) {
    score -= 30;
    deductions.push('freezing temperatures');
  } else if (currentTemp < 12) {
    score -= 15;
    deductions.push('cool air');
  }

  // Rain penalization
  if (maxRainProbIn12h >= 70 || maxPrecipIn12h >= 5) {
    score -= 40;
    deductions.push('high rain chance');
  } else if (maxRainProbIn12h >= 40) {
    score -= 20;
    deductions.push('scattered showers');
  }

  // Wind penalization
  if (windSpeed >= 40) {
    score -= 25;
    deductions.push('strong winds');
  } else if (windSpeed >= 25) {
    score -= 10;
    deductions.push('breezy gusts');
  }

  // UV penalization
  if (uvIndex >= 8) {
    score -= 15;
    deductions.push('very high UV');
  } else if (uvIndex >= 6) {
    score -= 10;
    deductions.push('moderate UV radiation');
  }

  // Humidity penalization
  if (humidity >= 85 && currentTemp >= 30) {
    score -= 10;
    deductions.push('high mugginess');
  }

  // Clamp score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  let category: ActivityCategory = 'Favorable';
  if (score < 50) {
    category = 'Unfavorable';
  } else if (score < 80) {
    category = 'Cautious';
  }

  let explanation = '';
  if (category === 'Favorable') {
    explanation = 'Conditions are supportive for outdoor plans and commuting.';
  } else if (deductions.length > 0) {
    explanation = `Caution advised outdoors primarily due to ${deductions.slice(0, 2).join(' and ')}.`;
  } else {
    explanation = 'Moderate weather conditions; stay mindful of changing temperatures.';
  }

  const activityAdvice: ActivityAdvice = {
    score,
    category,
    explanation,
  };

  // ----------------------------------------------------
  // C. clothingAdvice: Attire & Gear Recommendations
  // ----------------------------------------------------
  const clothingAdvice: string[] = [];

  // Rain rule
  if (maxRainProbIn12h >= 40 || maxPrecipIn12h > 0) {
    clothingAdvice.push('Carry an umbrella or rain-resistant outer layer.');
  }

  // Temperature rules
  if (currentTemp < 10) {
    clothingAdvice.push('Wear warm winter wear, a thermal base, or heavy jacket.');
  } else if (currentTemp < 15) {
    clothingAdvice.push('Layer up with a light jacket, sweater, or fleece.');
  } else if (currentTemp >= 35) {
    clothingAdvice.push('Wear light, breathable cotton fabrics and keep hydrated.');
  } else {
    clothingAdvice.push('Standard casual clothing suitable for mild outdoor temperatures.');
  }

  // UV rule
  if (uvIndex >= 6) {
    clothingAdvice.push('Wear sunglasses and apply SPF 30+ sunscreen outdoors.');
  }

  // Wind rule
  if (windSpeed >= 35) {
    clothingAdvice.push('Wind-resistant jacket advised against gusty winds.');
  }

  // ----------------------------------------------------
  // D. keyWindows: Time Windows for Best Outdoor, Rain, Heat, UV
  // ----------------------------------------------------
  const keyWindows: KeyWindow[] = [];

  // 1. Rain Window (if supported by hourly data)
  const rainyHours = next12Hours.filter(
    (h) => (h.rainProbability ?? 0) >= 40 || (h.precipitation ?? 0) > 0.5
  );
  if (rainyHours.length > 0) {
    const firstRain = rainyHours[0];
    const lastRain = rainyHours[rainyHours.length - 1];
    const timeRange = firstRain.time === lastRain.time ? firstRain.time : `${firstRain.time} � ${lastRain.time}`;
    keyWindows.push({
      type: 'rain',
      label: 'Rain likely',
      timeRange,
      detail: `Precipitation chance up to ${Math.max(...rainyHours.map((h) => h.rainProbability ?? 0))}%.`,
    });
  }

  // 2. Peak Heat Window
  const highestHourlyTemp = next12Hours.reduce(
    (max, h) => Math.max(max, h.temperature),
    -Infinity
  );
  const peakHeatHours = next12Hours.filter((h) => h.temperature === highestHourlyTemp);
  if (peakHeatHours.length > 0 && highestHourlyTemp >= 30) {
    const firstHeat = peakHeatHours[0];
    const lastHeat = peakHeatHours[peakHeatHours.length - 1];
    const timeRange = firstHeat.time === lastHeat.time ? firstHeat.time : `${firstHeat.time} � ${lastHeat.time}`;
    keyWindows.push({
      type: 'heat',
      label: 'Peak heat',
      timeRange,
      detail: `Temperatures peak around ${highestHourlyTemp}�C.`,
    });
  }

  // 3. Best Outdoor Window
  // Find continuous hours with rain prob < 30%, temp between 18�C and 32�C, wind < 25 km/h
  const idealHours = next12Hours.filter((h) => {
    const isComfortable = h.temperature >= 18 && h.temperature <= 32;
    const isDry = (h.rainProbability ?? 0) < 30;
    return isComfortable && isDry;
  });

  if (idealHours.length > 0) {
    const firstIdeal = idealHours[0];
    const lastIdeal = idealHours[idealHours.length - 1];
    const timeRange = firstIdeal.time === lastIdeal.time ? firstIdeal.time : `${firstIdeal.time} � ${lastIdeal.time}`;
    keyWindows.push({
      type: 'outdoor',
      label: 'Best outside',
      timeRange,
      detail: 'Optimal temperature and low precipitation probability.',
    });
  }

  // 4. High UV Window (Daytime hours around midday if current UV is elevated)
  if (uvIndex >= 6) {
    const daytimeMiddayHours = next12Hours.filter((h) => {
      const hour = h.hour ?? 12;
      return hour >= 11 && hour <= 15;
    });

    if (daytimeMiddayHours.length > 0) {
      const firstUV = daytimeMiddayHours[0];
      const lastUV = daytimeMiddayHours[daytimeMiddayHours.length - 1];
      const timeRange = firstUV.time === lastUV.time ? firstUV.time : `${firstUV.time} � ${lastUV.time}`;
      keyWindows.push({
        type: 'uv',
        label: 'High UV',
        timeRange,
        detail: `UV Index reaching ${uvIndex}; limit direct solar exposure.`,
      });
    }
  }

  return {
    dataAvailable: true,
    locationName: targetLocation,
    dailySummary,
    activityAdvice,
    clothingAdvice: clothingAdvice.slice(0, 3), // Top 3 practical recommendations
    keyWindows: keyWindows.slice(0, 3), // Top 3 most relevant windows
  };
}
