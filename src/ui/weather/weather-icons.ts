export function mapWeatherCodeToLucideIcon(weatherCode: number, isDay: boolean): string {
    if (weatherCode === 0) {
        return isDay ? "sun" : "moon"
    }

    if (weatherCode === 1 || weatherCode === 2) {
        return isDay ? "cloud-sun" : "cloud-moon"
    }

    if (weatherCode === 3) {
        return "cloud"
    }

    if (weatherCode === 45 || weatherCode === 48) {
        return "cloud-fog"
    }

    if (
        weatherCode === 51 ||
        weatherCode === 53 ||
        weatherCode === 55 ||
        weatherCode === 56 ||
        weatherCode === 57
    ) {
        return "cloud-drizzle"
    }

    if (
        weatherCode === 61 ||
        weatherCode === 63 ||
        weatherCode === 65 ||
        weatherCode === 66 ||
        weatherCode === 67 ||
        weatherCode === 80 ||
        weatherCode === 81 ||
        weatherCode === 82
    ) {
        return "cloud-rain"
    }

    if (
        weatherCode === 71 ||
        weatherCode === 73 ||
        weatherCode === 75 ||
        weatherCode === 77 ||
        weatherCode === 85 ||
        weatherCode === 86
    ) {
        return "cloud-snow"
    }

    if (weatherCode === 95 || weatherCode === 96 || weatherCode === 99) {
        return "cloud-lightning"
    }

    return "cloud"
}

export function getWeatherIconColor(weatherCode: number): string {
    if (weatherCode === 0 || weatherCode === 1 || weatherCode === 2) {
        return "#f59e0b"
    }

    if (weatherCode === 3 || weatherCode === 45 || weatherCode === 48) {
        return "#94a3b8"
    }

    if (
        weatherCode === 51 ||
        weatherCode === 53 ||
        weatherCode === 55 ||
        weatherCode === 56 ||
        weatherCode === 57 ||
        weatherCode === 61 ||
        weatherCode === 63 ||
        weatherCode === 65 ||
        weatherCode === 66 ||
        weatherCode === 67 ||
        weatherCode === 80 ||
        weatherCode === 81 ||
        weatherCode === 82
    ) {
        return "#3b82f6"
    }

    if (
        weatherCode === 71 ||
        weatherCode === 73 ||
        weatherCode === 75 ||
        weatherCode === 77 ||
        weatherCode === 85 ||
        weatherCode === 86
    ) {
        return "#67e8f9"
    }

    if (weatherCode === 95 || weatherCode === 96 || weatherCode === 99) {
        return "#8b5cf6"
    }

    return "#94a3b8"
}

export function mapWeatherCodeToLabel(weatherCode: number): string {
    if (weatherCode === 0) {
        return "Clear"
    }

    if (weatherCode === 1) {
        return "Mostly Clear"
    }

    if (weatherCode === 2) {
        return "Partly Cloudy"
    }

    if (weatherCode === 3) {
        return "Overcast"
    }

    if (weatherCode === 45 || weatherCode === 48) {
        return "Foggy"
    }

    if (weatherCode === 51 || weatherCode === 53 || weatherCode === 55) {
        return "Drizzle"
    }

    if (weatherCode === 56 || weatherCode === 57) {
        return "Freezing Drizzle"
    }

    if (weatherCode === 61 || weatherCode === 63 || weatherCode === 65) {
        return "Rain"
    }

    if (weatherCode === 66 || weatherCode === 67) {
        return "Freezing Rain"
    }

    if (weatherCode === 71 || weatherCode === 73 || weatherCode === 75) {
        return "Snow"
    }

    if (weatherCode === 77) {
        return "Snow Grains"
    }

    if (weatherCode === 80 || weatherCode === 81 || weatherCode === 82) {
        return "Showers"
    }

    if (weatherCode === 85 || weatherCode === 86) {
        return "Snow Showers"
    }

    if (weatherCode === 95) {
        return "Thunderstorm"
    }

    if (weatherCode === 96 || weatherCode === 99) {
        return "Thunderstorm with Hail"
    }

    return "Unknown"
}
