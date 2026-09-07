const PRODUCTION_API_URL = 'https://weathergpt-api-8f5b6e62-d9ae-478e-bf69-d09d63441131.fly.dev/api';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || PRODUCTION_API_URL;

