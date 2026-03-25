import { setIcon } from "obsidian"

import { getWeatherIconColor, mapWeatherCodeToLucideIcon } from "./weather-icons"
import type { DailyForecastType } from "./weather.types"

function formatDayName(isoDate: string): string {
    const date = new Date(`${isoDate}T00:00:00`)
    const today = new Date()

    today.setHours(0, 0, 0, 0)

    const diffDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
        return "Today"
    }

    if (diffDays === 1) {
        return "Tomorrow"
    }

    return date.toLocaleDateString("en-US", { weekday: "short" })
}

export function createDailyWeatherRow(dailyData: DailyForecastType[]): HTMLElement {
    const row = document.createElement("div")

    row.className = "kanban-weather__row"

    const label = document.createElement("div")

    label.className = "kanban-weather__row-label"
    label.textContent = "7-day"
    row.append(label)

    const scrollContainer = document.createElement("div")

    scrollContainer.className = "kanban-weather__scroll-container"
    scrollContainer.dataset.weatherRow = "daily"

    for (const forecast of dailyData) {
        const item = document.createElement("div")

        item.className = "kanban-weather__daily-item"

        const dayLabel = document.createElement("span")

        dayLabel.className = "kanban-weather__label"
        dayLabel.textContent = formatDayName(forecast.date)

        const iconContainer = document.createElement("span")

        iconContainer.className = "kanban-weather__icon"
        iconContainer.style.color = getWeatherIconColor(forecast.weatherCode)
        setIcon(iconContainer, mapWeatherCodeToLucideIcon(forecast.weatherCode, true))

        const highTemporary = document.createElement("span")

        highTemporary.className = "kanban-weather__temp"
        highTemporary.textContent = `${forecast.temperatureMax}°`

        const precipitation = document.createElement("span")

        precipitation.className = "kanban-weather__detail"
        precipitation.textContent = `${forecast.precipitationProbabilityMax}%`

        item.append(dayLabel, iconContainer, highTemporary, precipitation)

        scrollContainer.append(item)
    }

    row.append(scrollContainer)

    return row
}
