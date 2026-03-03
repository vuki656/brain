import { setIcon } from "obsidian"

import type { HourlyForecastType } from "./weather.types"
import { getWeatherIconColor, mapWeatherCodeToLucideIcon } from "./weather-icons"

function formatHour(isoTime: string): string {
    const date = new Date(isoTime)
    const hours = date.getHours()

    return `${hours}:00`
}

export function createHourlyWeatherRow(hourlyData: HourlyForecastType[]): HTMLElement {
    const row = document.createElement("div")

    row.className = "kanban-weather__row"

    const label = document.createElement("div")

    label.className = "kanban-weather__row-label"
    label.textContent = "Next 24h"
    row.append(label)

    const scrollContainer = document.createElement("div")

    scrollContainer.className = "kanban-weather__scroll-container"
    scrollContainer.dataset.weatherRow = "hourly"

    for (const forecast of hourlyData) {
        const item = document.createElement("div")

        item.className = "kanban-weather__hourly-item"

        const timeLabel = document.createElement("span")

        timeLabel.className = "kanban-weather__label"
        timeLabel.textContent = formatHour(forecast.time)

        const iconContainer = document.createElement("span")

        iconContainer.className = "kanban-weather__icon"
        iconContainer.style.color = getWeatherIconColor(forecast.weatherCode)
        setIcon(iconContainer, mapWeatherCodeToLucideIcon(forecast.weatherCode, forecast.isDay))

        const temperature = document.createElement("span")

        temperature.className = "kanban-weather__temp"
        temperature.textContent = `${forecast.temperature}°`

        item.append(timeLabel, iconContainer, temperature)

        if (forecast.precipitationProbability > 0) {
            const precipitation = document.createElement("span")

            precipitation.className = "kanban-weather__detail"
            precipitation.textContent = `${forecast.precipitationProbability}%`
            item.append(precipitation)
        }

        scrollContainer.append(item)
    }

    row.append(scrollContainer)

    return row
}
