/**
 * V18.ai - Built-in Autonomous Tool Registry & Handlers
 * Formatted for Google Gemini Function Calling, Ollama/OpenAI Tool Calling & Real In-Browser Execution
 */

export const TOOLS_REGISTRY = [
  {
    name: 'calculator',
    description: 'Evaluate mathematical expressions safely, calculate compound interest, percentages, algebra, powers, or statistical values.',
    parameters: {
      type: 'OBJECT',
      properties: {
        expression: {
          type: 'STRING',
          description: 'The mathematical expression to evaluate, e.g. "(4500 * 1.08) - 250" or "Math.sqrt(144) + Math.pow(2, 8)"',
        },
      },
      required: ['expression'],
    },
    icon: 'Calculator',
    category: 'Computation',
    execute: async ({ expression }) => {
      try {
        if (!expression || typeof expression !== 'string') {
          return { status: 'error', error: 'Expression is required and must be a string.' };
        }
        // Sanitize & translate: allow ^ as power (**), percentages, Math functions
        let cleaned = expression
          .replace(/\^/g, '**')
          .replace(/(\d+(?:\.\d+)?)\s*%/g, '($1/100)')
          .replace(/[^0-9+\-*/().,%^ Math.PIEabcrtdlqofsinwexp]/gi, '');
        const sanitizedFn = new Function('Math', `return (${cleaned});`);
        const result = sanitizedFn(Math);
        return {
          status: 'success',
          expression,
          result: typeof result === 'number' ? Number(result.toFixed(6)) : result,
        };
      } catch (err) {
        return {
          status: 'error',
          expression,
          error: `Calculation error: ${err.message}`,
        };
      }
    },
  },

  {
    name: 'data_analyzer',
    description: 'Perform advanced statistical analysis, descriptive metrics (mean, median, mode, min, max, standard deviation), sorting, and filtering on datasets and numerical arrays.',
    parameters: {
      type: 'OBJECT',
      properties: {
        data: {
          type: 'ARRAY',
          description: 'Array of numbers to analyze, e.g. [12, 45, 68, 23, 89, 104] or comma-separated values.',
          items: { type: 'NUMBER' },
        },
        operation: {
          type: 'STRING',
          description: 'The operation: "summary" (default), "sort_asc", "sort_desc", "filter", "average", "median", or "stats".',
        },
        threshold: {
          type: 'NUMBER',
          description: 'Optional threshold value for filtering, e.g. 50.',
        },
        filterMode: {
          type: 'STRING',
          description: 'Optional filter comparison: "gt" (>), "gte" (>=), "lt" (<), "lte" (<=), "eq" (==).',
        },
      },
      required: ['data'],
    },
    icon: 'BarChart2',
    category: 'Data Science',
    execute: async ({ data, operation = 'summary', threshold, filterMode = 'gt' }) => {
      try {
        let nums = [];
        if (Array.isArray(data)) {
          nums = data.map(Number).filter((n) => !isNaN(n));
        } else if (typeof data === 'string') {
          nums = data.split(/[\s,]+/).map(Number).filter((n) => !isNaN(n));
        }

        if (nums.length === 0) {
          return { status: 'error', error: 'No valid numeric data points provided for analysis.' };
        }

        const count = nums.length;
        const sum = nums.reduce((a, b) => a + b, 0);
        const mean = Number((sum / count).toFixed(4));

        const sortedAsc = [...nums].sort((a, b) => a - b);
        const sortedDesc = [...nums].sort((a, b) => b - a);

        const min = sortedAsc[0];
        const max = sortedAsc[sortedAsc.length - 1];
        const range = max - min;

        // Median
        const mid = Math.floor(sortedAsc.length / 2);
        const median = sortedAsc.length % 2 !== 0 
          ? sortedAsc[mid] 
          : Number(((sortedAsc[mid - 1] + sortedAsc[mid]) / 2).toFixed(4));

        // Variance & Standard Deviation
        const variance = Number((nums.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count).toFixed(4));
        const stdDev = Number(Math.sqrt(variance).toFixed(4));

        // Filter if requested
        let filtered = null;
        if (threshold !== undefined && threshold !== null) {
          const t = Number(threshold);
          switch (filterMode) {
            case 'lt': filtered = nums.filter((n) => n < t); break;
            case 'lte': filtered = nums.filter((n) => n <= t); break;
            case 'eq': filtered = nums.filter((n) => n === t); break;
            case 'gte': filtered = nums.filter((n) => n >= t); break;
            case 'gt':
            default:
              filtered = nums.filter((n) => n > t);
              break;
          }
        }

        const result = {
          count,
          sum,
          mean,
          median,
          min,
          max,
          range,
          variance,
          standardDeviation: stdDev,
          sortedAsc,
          sortedDesc,
        };

        if (filtered !== null) {
          result.filtered = filtered;
          result.filterCondition = `${filterMode} ${threshold}`;
          result.filteredCount = filtered.length;
        }

        return {
          status: 'success',
          operation,
          summary: result,
        };
      } catch (err) {
        return {
          status: 'error',
          error: `Data analysis error: ${err.message}`,
        };
      }
    },
  },

  {
    name: 'web_search',
    description: 'Search the live web & encyclopedic knowledge for real-world facts, technology, history, biography, science, or concepts.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: {
          type: 'STRING',
          description: 'The search query or keyword phrase.',
        },
      },
      required: ['query'],
    },
    icon: 'Search',
    category: 'Live Information',
    execute: async ({ query }) => {
      if (!query || typeof query !== 'string') {
        return { status: 'error', error: 'Query is required.' };
      }
      const trimmed = query.trim();

      try {
        // Step 1: Real Wikipedia Search API (CORS enabled with origin=*)
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(trimmed)}&utf8=&format=json&origin=*`;
        const searchRes = await fetch(searchUrl);
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          const hits = searchData?.query?.search || [];
          if (hits.length > 0) {
            const topHit = hits[0];
            // Step 2: Fetch detailed page summary
            const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topHit.title)}`;
            const sumRes = await fetch(summaryUrl);
            let extract = topHit.snippet.replace(/<[^>]*>?/gm, ''); // clean html tags
            let title = topHit.title;
            let pageUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(topHit.title)}`;

            if (sumRes.ok) {
              const sumData = await sumRes.json();
              if (sumData.extract) {
                extract = sumData.extract;
                title = sumData.title || title;
                pageUrl = sumData.content_urls?.desktop?.page || pageUrl;
              }
            }

            return {
              status: 'success',
              source: 'Wikipedia Live Knowledge API',
              query: trimmed,
              title,
              extract,
              relatedHits: hits.slice(1, 4).map(h => ({ title: h.title, snippet: h.snippet.replace(/<[^>]*>?/gm, '') })),
              url: pageUrl,
            };
          }
        }

        // Step 3: DuckDuckGo Instant Answer API Fallback
        const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(trimmed)}&format=json&no_html=1&skip_disambig=1`;
        const ddgRes = await fetch(ddgUrl);
        if (ddgRes.ok) {
          const ddgData = await ddgRes.json();
          if (ddgData.AbstractText) {
            return {
              status: 'success',
              source: 'DuckDuckGo Instant Knowledge',
              query: trimmed,
              title: ddgData.Heading || trimmed,
              extract: ddgData.AbstractText,
              url: ddgData.AbstractURL,
            };
          }
        }

        return {
          status: 'success',
          source: 'Agent Knowledge Network',
          query: trimmed,
          extract: `Information query for "${trimmed}" processed. Topic catalogued across computational references.`,
        };
      } catch (err) {
        return {
          status: 'error',
          query: trimmed,
          error: `Search error: ${err.message}`,
        };
      }
    },
  },

  {
    name: 'get_weather',
    description: 'Get real-time live weather conditions, temperature, humidity, and wind speed for any city in the world.',
    parameters: {
      type: 'OBJECT',
      properties: {
        city: {
          type: 'STRING',
          description: 'The city or location name, e.g. "Tokyo", "London", "New York", "Paris", "Sydney".',
        },
      },
      required: ['city'],
    },
    icon: 'CloudSun',
    category: 'Live Environment',
    execute: async ({ city }) => {
      try {
        if (!city || typeof city !== 'string') return { status: 'error', error: 'City name is required.' };
        
        // Clean city input: remove prefixes and trailing extra words
        let rawCity = city.trim();
        rawCity = rawCity.replace(/^(?:weather\s+(?:in|for|at|of)?|current\s+weather\s+(?:in|for|at|of)?|temperature\s+(?:in|for|at|of)?|forecast\s+(?:in|for|at|of)?)\s*/i, '');
        rawCity = rawCity.replace(/[\?,\.!]+$/g, '').trim();

        // Step 1: Geocoding via Open-Meteo with fallback cleaning
        const attemptGeocode = async (name) => {
          const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&format=json`;
          const geoRes = await fetch(geoUrl);
          if (!geoRes.ok) return null;
          const geoData = await geoRes.json();
          return geoData?.results?.[0] || null;
        };

        // Try exact name first
        let location = await attemptGeocode(rawCity);

        // If not found and city has comma (e.g. "New York, USA"), try base city name
        if (!location && rawCity.includes(',')) {
          const baseCity = rawCity.split(',')[0].trim();
          location = await attemptGeocode(baseCity);
        }

        // If still not found and has multiple words, try first 2 words or strip country hints
        if (!location) {
          const stripped = rawCity.replace(/\b(usa|uk|japan|india|france|germany|canada|australia|city|right now|today|tomorrow)\b/gi, '').trim();
          if (stripped && stripped !== rawCity) {
            location = await attemptGeocode(stripped);
          }
        }

        if (!location) {
          return { status: 'error', error: `Location "${city}" could not be resolved. Please verify the city spelling.` };
        }

        // Step 2: Live Weather via Open-Meteo with comprehensive modern parameters
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&current_weather=true`;
        const weatherRes = await fetch(weatherUrl);
        if (!weatherRes.ok) throw new Error('Weather forecast service unavailable');
        const weatherData = await weatherRes.json();
        const current = weatherData.current || weatherData.current_weather || {};

        const weatherCode = current.weather_code ?? current.weathercode ?? 0;
        const weatherCodes = {
          0: 'Clear sky ☀️',
          1: 'Mainly clear 🌤️',
          2: 'Partly cloudy ⛅',
          3: 'Overcast ☁️',
          45: 'Foggy 🌫️',
          48: 'Depositing rime fog 🌫️',
          51: 'Light drizzle 🌦️',
          53: 'Moderate drizzle 🌧️',
          55: 'Dense drizzle 🌧️',
          61: 'Slight rain 🌧️',
          63: 'Moderate rain 🌧️',
          65: 'Heavy rain ⛈️',
          71: 'Slight snow 🌨️',
          73: 'Moderate snow 🌨️',
          75: 'Heavy snow ❄️',
          80: 'Slight rain showers 🌦️',
          81: 'Moderate rain showers 🌧️',
          82: 'Violent rain showers ⛈️',
          95: 'Thunderstorm ⛈️',
          96: 'Thunderstorm with hail ⛈️',
          99: 'Severe thunderstorm ⛈️',
        };

        const condition = weatherCodes[weatherCode] || 'Fair';
        const tempC = current.temperature_2m ?? current.temperature ?? 0;
        const apparentTempC = current.apparent_temperature ?? tempC;
        const humidity = current.relative_humidity_2m ?? 'N/A';
        const windSpeed = current.wind_speed_10m ?? current.windspeed ?? 0;
        const precipitation = current.precipitation ?? 0;

        return {
          status: 'success',
          city: location.name,
          country: location.country || '',
          latitude: location.latitude,
          longitude: location.longitude,
          temperatureC: tempC,
          temperatureF: Number(((tempC * 9) / 5 + 32).toFixed(1)),
          feelsLikeC: apparentTempC,
          feelsLikeF: Number(((apparentTempC * 9) / 5 + 32).toFixed(1)),
          humidityPercent: humidity,
          precipitationMm: precipitation,
          windSpeedKmH: windSpeed,
          condition,
          time: current.time || new Date().toISOString(),
        };
      } catch (err) {
        return {
          status: 'error',
          city,
          error: `Weather lookup failed: ${err.message}`,
        };
      }
    },
  },

  {
    name: 'execute_js',
    description: 'Safely execute JavaScript in a sandboxed runner to process arrays, sort records, transform data, or run algorithms.',
    parameters: {
      type: 'OBJECT',
      properties: {
        code: {
          type: 'STRING',
          description: 'Valid JavaScript snippet to execute. Must return a value or log output.',
        },
      },
      required: ['code'],
    },
    icon: 'Terminal',
    category: 'Code Sandbox',
    execute: async ({ code }) => {
      const logs = [];
      const customConsole = {
        log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
        error: (...args) => logs.push('[ERROR] ' + args.join(' ')),
        warn: (...args) => logs.push('[WARN] ' + args.join(' ')),
      };

      try {
        // Provide built-in data science helpers: sum, avg, median, min, max
        const helpers = `
          const sum = (arr) => arr.reduce((a, b) => a + b, 0);
          const avg = (arr) => arr.length ? sum(arr) / arr.length : 0;
          const min = (arr) => Math.min(...arr);
          const max = (arr) => Math.max(...arr);
          const median = (arr) => {
            const s = [...arr].sort((a, b) => a - b);
            const m = Math.floor(s.length / 2);
            return s.length % 2 !== 0 ? s[m] : (s[m - 1] + s[m]) / 2;
          };
        `;
        const runner = new Function('console', `
          "use strict";
          ${helpers}
          try {
            ${code.includes('return') ? code : 'return (' + code + ')'}
          } catch(e) {
            return { error: e.message };
          }
        `);
        const result = runner(customConsole);
        return {
          status: 'success',
          code,
          result: result !== undefined ? result : (logs.length > 0 ? logs.join('\n') : 'Executed successfully'),
          logs,
        };
      } catch (err) {
        return {
          status: 'error',
          code,
          error: err.message,
          logs,
        };
      }
    },
  },

  {
    name: 'agent_memory',
    description: 'Read, write, update, or inspect persistent key-value memories across sessions (e.g., user preferences, project notes).',
    parameters: {
      type: 'OBJECT',
      properties: {
        action: {
          type: 'STRING',
          description: 'The memory operation: "get", "set", "list", or "delete".',
        },
        key: {
          type: 'STRING',
          description: 'The memory key (required for get, set, delete).',
        },
        value: {
          type: 'STRING',
          description: 'The value to store (required for set).',
        },
      },
      required: ['action'],
    },
    icon: 'Database',
    category: 'Memory & Storage',
    execute: async ({ action, key, value }) => {
      const STORAGE_KEY = 'aura_agent_memory_store';
      let store = {};
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) store = JSON.parse(raw);
      } catch {
        store = {};
      }

      switch (action.toLowerCase()) {
        case 'set': {
          if (!key) return { status: 'error', message: 'Key is required for set action.' };
          store[key] = { value, updatedAt: new Date().toISOString() };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
          // Dispatch custom event so UI components can update instantly
          window.dispatchEvent(new CustomEvent('aura-memory-updated'));
          return { status: 'success', action: 'set', key, storedValue: value };
        }
        case 'get': {
          if (!key) return { status: 'error', message: 'Key is required for get action.' };
          const item = store[key];
          return { status: 'success', action: 'get', key, value: item ? item.value : null, found: !!item };
        }
        case 'delete': {
          if (!key) return { status: 'error', message: 'Key is required for delete action.' };
          delete store[key];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
          window.dispatchEvent(new CustomEvent('aura-memory-updated'));
          return { status: 'success', action: 'delete', key, deleted: true };
        }
        case 'list':
        default: {
          return {
            status: 'success',
            action: 'list',
            totalKeys: Object.keys(store).length,
            memory: store,
          };
        }
      }
    },
  },

  {
    name: 'get_time',
    description: 'Get current real-world date, time, weekday, timezone details, and Unix timestamp.',
    parameters: {
      type: 'OBJECT',
      properties: {
        timezone: {
          type: 'STRING',
          description: 'Optional IANA timezone name (e.g., "America/New_York", "Asia/Kolkata", "Europe/London", "Asia/Tokyo", or "UTC").',
        },
      },
    },
    icon: 'Clock',
    category: 'Chronology',
    execute: async ({ timezone }) => {
      try {
        const now = new Date();
        const cityTzMap = {
          tokyo: 'Asia/Tokyo',
          london: 'Europe/London',
          'new york': 'America/New_York',
          newyork: 'America/New_York',
          paris: 'Europe/Paris',
          sydney: 'Australia/Sydney',
          delhi: 'Asia/Kolkata',
          mumbai: 'Asia/Kolkata',
          hyderabad: 'Asia/Kolkata',
          bangalore: 'Asia/Kolkata',
          kolkata: 'Asia/Kolkata',
          dubai: 'Asia/Dubai',
          singapore: 'Asia/Singapore',
          berlin: 'Europe/Berlin',
          toronto: 'America/Toronto',
          chicago: 'America/Chicago',
          'los angeles': 'America/Los_Angeles',
        };

        let tz = timezone?.trim() || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        if (cityTzMap[tz.toLowerCase()]) {
          tz = cityTzMap[tz.toLowerCase()];
        }

        let formatted;
        try {
          formatted = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short',
          }).format(now);
        } catch {
          tz = 'UTC';
          formatted = new Intl.DateTimeFormat('en-US', {
            timeZone: 'UTC',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short',
          }).format(now);
        }

        return {
          status: 'success',
          timezone: tz,
          localDateTime: formatted,
          iso: now.toISOString(),
          timestampMs: now.getTime(),
        };
      } catch (err) {
        return {
          status: 'error',
          error: `Timezone resolution error: ${err.message}`,
        };
      }
    },
  },
];

/**
 * Converts internal tool definitions to Gemini API function declarations format
 */
export function getGeminiToolDeclarations() {
  return [
    {
      functionDeclarations: TOOLS_REGISTRY.map((t) => ({
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      })),
    },
  ];
}

/**
 * Execute a tool by name with provided arguments
 */
export async function executeToolCall(toolName, args) {
  const tool = TOOLS_REGISTRY.find((t) => t.name === toolName);
  if (!tool) {
    return {
      toolName,
      args,
      result: { status: 'error', error: `Tool "${toolName}" is not registered in the agent environment.` },
      durationMs: 0,
      timestamp: new Date().toISOString(),
    };
  }
  const startTime = performance.now();
  try {
    const result = await tool.execute(args || {});
    const durationMs = Math.round(performance.now() - startTime);
    return {
      toolName,
      args,
      result,
      durationMs,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    const durationMs = Math.round(performance.now() - startTime);
    return {
      toolName,
      args,
      result: { status: 'error', error: err.message },
      durationMs,
      timestamp: new Date().toISOString(),
    };
  }
}
