import type { WeatherDataType, WeatherLocationType } from "./weather.types"
import { fetchWeatherFromApi } from "./weather-api"

type CacheEntryType = {
    data: WeatherDataType
    timestamp: number
}

const CACHE_TTL_MS = 30 * 60 * 1000

let cachedEntry: CacheEntryType | null = null
let cachedLocationKey: string | null = null

function getLocationKey(location: WeatherLocationType): string {
    return `${location.latitude},${location.longitude}`
}

export async function fetchWeatherData(location: WeatherLocationType): Promise<WeatherDataType> {
    const locationKey = getLocationKey(location)
    const now = Date.now()

    if (
        cachedEntry &&
        cachedLocationKey === locationKey &&
        now - cachedEntry.timestamp < CACHE_TTL_MS
    ) {
        return cachedEntry.data
    }

    try {
        const data = await fetchWeatherFromApi(location)
        const entry: CacheEntryType = { data, timestamp: now }

        cachedEntry = entry // eslint-disable-line require-atomic-updates -- intentional cache update after async fetch
        cachedLocationKey = locationKey // eslint-disable-line require-atomic-updates -- intentional cache update after async fetch

        return data
    } catch (error) {
        const staleEntry = cachedEntry

        if (staleEntry && cachedLocationKey === locationKey) {
            console.warn("Weather fetch failed, returning stale cache", error)

            return staleEntry.data
        }

        throw error
    }
}
