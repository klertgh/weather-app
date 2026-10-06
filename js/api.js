export async function getWeather(latitude, longitude, units) {
    try {
        const params = new URLSearchParams({
        latitude: latitude,
        longitude: longitude,
        current: "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation,weather_code",
        daily: "weather_code,temperature_2m_max,temperature_2m_min",
        hourly: "weather_code,temperature_2m",
        timezone: "auto",
        temperature_unit: units.temperature,
        wind_speed_unit: units.wind,
        precipitation_unit: units.rainfall
        })

        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)

        if (!response.ok) {
            throw new Error("Ошибкаааааа")
        }

        const data = await response.json()
        console.log(data)
        return data

    } catch (error) {
        console.log(error)
    }
    
}