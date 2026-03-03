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
