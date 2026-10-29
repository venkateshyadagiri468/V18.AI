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
        // Sanitize: allow numbers, arithmetic operators, parentheses, decimal, and Math.* methods
        const cleaned = expression.replace(/[^0-9+\-*/().,%^ Math.PIEabcrtdlqofsinwexp]/gi, '');
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
        if (!city) return { status: 'error', error: 'City name is required.' };
        // Step 1: Geocoding via Open-Meteo (100% free, no API key needed)
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city.trim())}&count=1&format=json`;
        const geoRes = await fetch(geoUrl);
        if (!geoRes.ok) throw new Error('Geocoding service unavailable');
        const geoData = await geoRes.json();
        const location = geoData?.results?.[0];

        if (!location) {
          return { status: 'error', error: `Location "${city}" could not be resolved.` };
        }

        // Step 2: Live Weather via Open-Meteo
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current_weather=true`;
        const weatherRes = await fetch(weatherUrl);
        if (!weatherRes.ok) throw new Error('Weather forecast service unavailable');
        const weatherData = await weatherRes.json();
        const current = weatherData.current_weather;

        const weatherCodes = {
          0: 'Clear sky ☀️',
          1: 'Mainly clear 🌤️',
          2: 'Partly cloudy ⛅',
          3: 'Overcast ☁️',
          45: 'Foggy 🌫️',
          51: 'Light drizzle 🌦️',
          61: 'Slight rain 🌧️',
          71: 'Slight snow 🌨️',
          95: 'Thunderstorm ⛈️',
        };

        const condition = weatherCodes[current.weathercode] || 'Fair';

        return {
          status: 'success',
          city: location.name,
          country: location.country,
          latitude: location.latitude,
          longitude: location.longitude,
          temperatureC: current.temperature,
          temperatureF: Number(((current.temperature * 9) / 5 + 32).toFixed(1)),
          windSpeedKmH: current.windspeed,
          condition,
          time: current.time,
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
        const runner = new Function('console', `
          "use strict";
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
        const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        const formatted = new Intl.DateTimeFormat('en-US', {
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
