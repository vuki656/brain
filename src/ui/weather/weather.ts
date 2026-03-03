import type { WeatherLocationType } from "./weather.types"
import { fetchWeatherData } from "./weather-cache"
import { createCurrentWeatherBanner } from "./weather-current"
import { createDailyWeatherRow } from "./weather-daily"
import { createHourlyWeatherRow } from "./weather-hourly"

export async function renderWeatherSection(
    container: HTMLElement,
    location: WeatherLocationType,
): Promise<void> {
    const wrapper = document.createElement("div")

    wrapper.className = "kanban-weather"

    const loading = document.createElement("div")

    loading.className = "kanban-weather__loading"
    loading.textContent = "Loading weather..."
    wrapper.append(loading)
    container.append(wrapper)

    try {
        const weatherData = await fetchWeatherData(location)

        wrapper.empty()
        wrapper.append(createCurrentWeatherBanner(weatherData.current))
        wrapper.append(createHourlyWeatherRow(weatherData.hourly))
        wrapper.append(createDailyWeatherRow(weatherData.daily))
    } catch (error) {
        console.error("Failed to load weather data", error)

        wrapper.empty()

        const errorMessage = document.createElement("div")

        errorMessage.className = "kanban-weather__error"
        errorMessage.textContent = "Could not load weather"
        wrapper.append(errorMessage)
    }
}

export function parseWeatherLocation(
    latitude: string,
    longitude: string,
): WeatherLocationType | null {
    const parsedLatitude = Number.parseFloat(latitude)
    const parsedLongitude = Number.parseFloat(longitude)

    if (Number.isNaN(parsedLatitude) || Number.isNaN(parsedLongitude)) {
        return null
    }

    return { latitude: parsedLatitude, longitude: parsedLongitude }
}
