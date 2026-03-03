import { requestUrl } from "obsidian"

import type { WeatherDataType, WeatherLocationType } from "./weather.types"

export async function fetchWeatherFromApi(location: WeatherLocationType): Promise<WeatherDataType> {
    const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${location.latitude}` +
        `&longitude=${location.longitude}` +
        `&current=temperature_2m,weather_code,is_day` +
        `&hourly=temperature_2m,precipitation_probability,weather_code,is_day` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
        `&temperature_unit=celsius` +
        `&timezone=auto` +
        `&forecast_days=7`

    const response = await requestUrl({ url })
    const data = response.json

    const hourly: WeatherDataType["hourly"] = []
    const now = new Date()
    const endOfDay = new Date(now)

    endOfDay.setHours(23, 59, 59, 999)

    for (let index = 0; index < data.hourly.time.length; index++) {
        const time = data.hourly.time[index] as string
        const forecastTime = new Date(time)

        if (forecastTime < now) {
            continue
        }

        if (forecastTime > endOfDay) {
            break
        }

        hourly.push({
            isDay: data.hourly.is_day[index] === 1,
            precipitationProbability: data.hourly.precipitation_probability[index] as number,
            temperature: Math.round(data.hourly.temperature_2m[index] as number),
            time,
            weatherCode: data.hourly.weather_code[index] as number,
        })
    }

    const daily: WeatherDataType["daily"] = []

    for (let index = 0; index < data.daily.time.length; index++) {
        daily.push({
            date: data.daily.time[index] as string,
            precipitationProbabilityMax: data.daily.precipitation_probability_max[index] as number,
            temperatureMax: Math.round(data.daily.temperature_2m_max[index] as number),
            temperatureMin: Math.round(data.daily.temperature_2m_min[index] as number),
            weatherCode: data.daily.weather_code[index] as number,
        })
    }

    const todayDaily = daily[0]
    const current: WeatherDataType["current"] = {
        isDay: data.current.is_day === 1,
        temperature: Math.round(data.current.temperature_2m as number),
        temperatureMax: todayDaily ? todayDaily.temperatureMax : 0,
        temperatureMin: todayDaily ? todayDaily.temperatureMin : 0,
        weatherCode: data.current.weather_code as number,
    }

    return { current, daily, hourly }
}
