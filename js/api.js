export async function getWeather(latitude, longitude, units) {
    const params = new URLSearchParams({
    latitude: latitude,
    longitude: longitude,
    current: "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation,weather_code",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,temperature_2m_mean,apparent_temperature_mean,relative_humidity_2m_mean,wind_speed_10m_mean,precipitation_sum",
    hourly: "weather_code,temperature_2m",
    forecast_days: 10,
    timezone: "auto",
    temperature_unit: units.temperature,
    wind_speed_unit: units.wind,
    precipitation_unit: units.rainfall
    })

    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)

    if (!response.ok) {
        throw new Error("Ошибка в получении прогноза")
    }

    const data = await response.json()
    return data
    
}

export async function getLocation(name) {
    const params = new URLSearchParams({
        name: name,
        count: 10,
        language: "ru",
        timezone: "timezone",
    })

    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`)

    if (!response.ok) {
        throw new Error("Ошибка поиска города")
    }

    const data = await response.json()
    return data
    
}

export async function getCityByCoords(latitude, longitude) {
    const params = new URLSearchParams({
        latitude: latitude,
        longitude: longitude,
        localityLanguage: "ru"
    })

    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?${params}`)

    if (!response.ok) {
        throw new Error("Ошибка определения города по коррдинатам")
    }

    const data = await response.json()
    return data
    
}