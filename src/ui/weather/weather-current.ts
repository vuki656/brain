import { setIcon } from "obsidian"

import {
    getWeatherIconColor,
    mapWeatherCodeToLabel,
    mapWeatherCodeToLucideIcon,
} from "./weather-icons"
import type { CurrentWeatherType } from "./weather.types"

export function createCurrentWeatherBanner(current: CurrentWeatherType): HTMLElement {
    const banner = document.createElement("div")

    banner.className = "kanban-weather__current"

    const iconContainer = document.createElement("span")

    iconContainer.className = "kanban-weather__current-icon"
    iconContainer.style.color = getWeatherIconColor(current.weatherCode)
    setIcon(iconContainer, mapWeatherCodeToLucideIcon(current.weatherCode, current.isDay))

    const temperature = document.createElement("span")

    temperature.className = "kanban-weather__current-temp"
    temperature.textContent = `${current.temperature}°`

    const description = document.createElement("span")

    description.className = "kanban-weather__current-desc"
    description.textContent = mapWeatherCodeToLabel(current.weatherCode)

    const highLow = document.createElement("span")

    highLow.className = "kanban-weather__current-range"
    highLow.textContent = `H:${current.temperatureMax}° L:${current.temperatureMin}°`

    banner.append(iconContainer, temperature, description, highLow)

    return banner
}
