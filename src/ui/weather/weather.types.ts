export type WeatherLocationType = {
    latitude: number
    longitude: number
}

export type HourlyForecastType = {
    isDay: boolean
    precipitationProbability: number
    temperature: number
    time: string
    weatherCode: number
}

export type DailyForecastType = {
    date: string
    precipitationProbabilityMax: number
    temperatureMax: number
    temperatureMin: number
    weatherCode: number
}

export type CurrentWeatherType = {
    isDay: boolean
    temperature: number
    temperatureMax: number
    temperatureMin: number
    weatherCode: number
}

export type WeatherDataType = {
    current: CurrentWeatherType
    daily: DailyForecastType[]
    hourly: HourlyForecastType[]
}
