// You may edit this file, add new files to support this file,
// and/or add new dependencies to the project as you see fit.
// However, you must not change the surface API presented from this file,
// and you should not need to change any other files in the project to complete the challenge

import { useEffect, useRef, useState } from "react";

// Data Type representing an object contained in the array fetched from randomapi
export interface Person {
  first: string;
  last: string;
  email: string;
  address: string;
  created: string;
  balance: string;
}
// For response data type validation
const personKeyRecord: Record<keyof Person, true> = {
  first: true,
  last: true,
  email: true,
  address: true,
  created: true,
  balance: true,
};
const personKeySet = new Set(Object.keys(personKeyRecord));

type UseCachingFetch = (url: string) => {
  isLoading: boolean;
  data: Person[]; // Changed the return type of our hook to conform to our defined data type
  error: Error | null;
};

/**
 * 1. Implement a caching fetch hook. The hook should return an object with the following properties:
 * - isLoading: a boolean that is true when the fetch is in progress and false otherwise
 * - data: the data returned from the fetch, or null if the fetch has not completed
 * - error: an error object if the fetch fails, or null if the fetch is successful
 *
 * This hook is called three times on the client:
 *  - 1 in App.tsx
 *  - 2 in Person.tsx
 *  - 3 in Name.tsx
 *
 * Acceptance Criteria:
 * 1. The application at /appWithoutSSRData should properly render, with JavaScript enabled, you should see a list of people.
 * 2. You should only see 1 network request in the browser's network tab when visiting the /appWithoutSSRData route.
 * 3. You have not changed any code outside of this file to achieve this.
 * 4. This file passes a type-check.
 *
 */

let cache: Person[] = [];

export const useCachingFetch: UseCachingFetch = (url) => {
  console.log("[useCachingFetch] Hook called");
  const isPreloaded = cache.length != 0;
  const [data, setData] = useState<Person[]>(cache); // Default set to load cache if available
  const [isLoading, setIsLoading] = useState(!isPreloaded); // Default false if cache is available so server html renders
  const errorRef = useRef<Error | null>(null);

  useEffect(() => {
    const tryFetchData = async () => {
      try {
        setIsLoading(true);
        await fetchData(url).then((res) => setData(res));
      } catch (err) {
        const error = err as Error;
        errorRef.current = error;
      }
    };

    if (!isPreloaded) {
      tryFetchData();
    }
    if (isLoading) {
      setIsLoading(false);
    }
  }, [data]);

  return {
    data,
    isLoading,
    error: errorRef.current,
  };
};

// Function that fetches from url and returns a validated data object asynchronously
const fetchData = async (url: string): Promise<Person[]> => {
  let data: unknown = undefined;
  // API response returns a ReadableStream, so we need to decode and parse it
  await fetch(url).then(async (res) => {
    if (!res || !res.body) {
      throw new Error(`[fetchData] No response recieved from ${url}`);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      data = JSON.parse(chunk);
    }
  });

  // Validate that the data is an array to filter for valid elements
  if (!Array.isArray(data)) {
    throw new Error(
      "[fetchData] API Response data is not in the proper format (array)"
    );
  }

  // Validate elements to create typed Person[]
  const personData = data.filter((object) => isPerson(object));
  // Cache data and return
  console.log("[fetchData] Data successfully cached");
  cache = personData;
  return personData;
};

// Validates that an unknown is a valid JavaScript Object
function isValidObject(object: unknown): object is object {
  return typeof object === "object" && !Array.isArray(object);
}

// Validates that response data has keys matching our Person data type
function isPerson(object: unknown): object is Person {
  if (!isValidObject(object)) {
    return false;
  }
  const keys = Object.keys(object);
  return keys.every((key) => personKeySet.has(key));
}

/**
 * 2. Implement a preloading caching fetch function. The function should fetch the data.
 *
 * This function will be called once on the server before any rendering occurs.
 *
 * Any subsequent call to useCachingFetch should result in the returned data being available immediately.
 * Meaning that the page should be completely serverside rendered on /appWithSSRData
 *
 * Acceptance Criteria:
 * 1. The application at /appWithSSRData should properly render, with JavaScript disabled, you should see a list of people.
 * 2. You have not changed any code outside of this file to achieve this.
 * 3. This file passes a type-check.
 *
 */

export const preloadCachingFetch = async (url: string): Promise<void> => {
  console.log("[preloadCachingFetch] Preloading cache");
  await fetchData(url);
};

/**
 * 3.1 Implement a serializeCache function that serializes the cache to a string.
 * 3.2 Implement an initializeCache function that initializes the cache from a serialized cache string.
 *
 * Together, these two functions will help the framework transfer your cache to the browser.
 *
 * The framework will call `serializeCache` on the server to serialize the cache to a string and inject it into the dom.
 * The framework will then call `initializeCache` on the browser with the serialized cache string to initialize the cache.
 *
 * Acceptance Criteria:
 * 1. The application at /appWithSSRData should properly render, with JavaScript enabled, you should see a list of people.
 * 2. You should not see any network calls to the people API when visiting the /appWithSSRData route.
 * 3. You have not changed any code outside of this file to achieve this.
 * 4. This file passes a type-check.
 *
 */
export const serializeCache = (): string => {
  return JSON.stringify(cache);
};

export const initializeCache = (serializedCache: string): void => {
  cache = JSON.parse(serializedCache);
};

export const wipeCache = (): void => {
  cache = [];
};
