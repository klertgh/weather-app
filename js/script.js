import { getWeather } from "./api.js"
import { getLocation } from "./api.js"

let weatherData = null

const unitsBtn = document.querySelector(".units__button")
const unitsList = document.querySelector(".units__list")
const unitName = document.querySelector(".units__item--name")
const unitBtns = unitsList.querySelectorAll("[data-unit][data-value]")
let isUnitsOpen = false
const units = {temperature: "celsius", wind: "ms", rainfall: "mm"}

const searchForm = document.querySelector(".search")
const searchInput = document.querySelector(".search__input")
const searchSuggestions = document.querySelector(".search__suggestions")

const currentCity = document.querySelector(".today__city")
const currentCountry = document.querySelector(".today__country")
const currentDay = document.querySelector(".today__day")
const currentIcon = document.querySelector(".today__icon")
const currentDegree = document.querySelector(".today__degrees")
const currentApparentTemp = document.querySelector("#feels")
const currentHumidity = document.querySelector('#humidity')
const currentWind = document.querySelector('#wind')
const currentPrecipitation = document.querySelector('#precipitation')

const dailyItems = document.querySelector(".daily__items")
const hourlyItems = document.querySelector(".hourly__items")

const weatherIcons = {
    sunny: {
        codes: [0, 1],
        src: "./assets/images/icon-sunny.webp"
    },

    partlyCloudy: {
        codes: [2],
        src: "./assets/images/icon-partly-cloudy.webp"
    },

    overcast: {
        codes: [3],
        src: "./assets/images/icon-overcast.webp"
    },

    fog: {
        codes: [45, 48],
        src: "./assets/images/icon-fog.webp"
    },

    drizzle: {
        codes: [51, 53, 55, 56, 57],
        src: "./assets/images/icon-drizzle.webp"
    },

    rain: {
        codes: [61, 63, 65, 66, 67, 80, 81, 82],
        src: "./assets/images/icon-rain.webp"
    },

    snow: {
        codes: [71, 73, 75, 77, 85, 86],
        src: "./assets/images/icon-snow.webp"
    },

    storm: {
        codes: [95, 96, 97, 99],
        src: "./assets/images/icon-storm.webp"
    }
}
function getWeatherIcone(code) {
    for (const group of Object.values(weatherIcons)) {
        if (group.codes.includes(code)) {
            return group.src
        }
    }
}

document.addEventListener("click", function(event) {
    if (!searchSuggestions.contains(event.target)) {
        searchSuggestions.classList.remove("search__suggestions--open")
    }
})

unitsBtn.addEventListener("click", function() {
    isUnitsOpen = !isUnitsOpen
    unitsList.classList.toggle("units__list--open", isUnitsOpen)
})

unitsList.addEventListener("click", function(event){
    const btn = event.target.closest(".units__item--btn")
    if (!btn) {
        return
    }
    
    const system = btn.dataset.system
    const unit = btn.dataset.unit
    const value = btn.dataset.value

    if (system=="imperial") {
        unitName.textContent = "метрическую"
        btn.dataset.system = "metric"

        units.temperature = "fahrenheit"
        units.wind = "mph"
        units.rainfall = "inch"
    }
    if (system=="metric") {
        unitName.textContent = "имперскую"
        btn.dataset.system = "imperial"

        units.temperature = "celsius"
        units.wind = "ms"
        units.rainfall = "mm"
    }

    if (unit&&value) {
        units[unit]=value
    }
    
    updateSelectedUnits()
})

function updateSelectedUnits() {
    unitBtns.forEach(function(unitBtn) {
        const unit = unitBtn.dataset.unit
        const value = unitBtn.dataset.value

        const isSelected = units[unit] === value
        unitBtn.parentElement.classList.toggle("units__item--selected", isSelected)
    })
}

searchInput.addEventListener("input", async function(event) {

    const valueSearch = searchInput.value.trim()
    if (valueSearch.length < 3) {
        searchSuggestions.replaceChildren()
    } else {
        const suggestions = await getLocation(valueSearch)
        renderSearchHint(suggestions)
    }
    searchSuggestions.classList.toggle("search__suggestions--open", searchSuggestions.children.length > 0)
})

function renderSearchHint(suggestions) {
    searchSuggestions.replaceChildren()
    if (!suggestions?.results) return;
    suggestions.results.forEach(function(hintSearch) {
        const li = document.createElement("li")
        const button = document.createElement("button")
        button.dataset.latitude = hintSearch.latitude
        button.dataset.longitude = hintSearch.longitude
        button.dataset.name = hintSearch.name;
        button.dataset.country = hintSearch.country;
        button.type = "button"
        button.classList.add("search__hint-button")
        button.textContent = `${hintSearch.name}, ${hintSearch.admin1}, ${hintSearch.country}`
        li.append(button)
        searchSuggestions.append(li)
    })
    
}

searchSuggestions.addEventListener("click", function(event) {
    const buttonCity = event.target.closest(".search__hint-button");
    if (!buttonCity) return;

    const city = {name: buttonCity.dataset.name,
        country: buttonCity.dataset.country,
        latitude: +buttonCity.dataset.latitude,
        longitude: +buttonCity.dataset.longitude
    }

    searchInput.value = ""
    searchSuggestions.classList.remove("search__suggestions--open");

    init(city)
})

function renderCurrentWeather(data, date) {
    const isDate = date != null
    let index
    if (isDate) {
        index = data.daily.time.indexOf(date)
    }

    const degree = isDate ? data.daily.temperature_2m_mean[index] : data.current.temperature_2m
    const apparentTemp = isDate ? data.daily.apparent_temperature_mean[index] : data.current.apparent_temperature
    const humidity = isDate ? data.daily.relative_humidity_2m_mean[index] : data.current.relative_humidity_2m
    const precipitation = isDate ? data.daily.precipitation_sum[index] : data.current.precipitation
    const wind = isDate ? data.daily.wind_speed_10m_mean[index] : data.current.wind_speed_10m
    const codeIcon = isDate ? data.daily.weather_code[index] : data.current.weather_code
    currentIcon.setAttribute("src", getWeatherIcone(codeIcon))

    const day = isDate ? new Date(date).toLocaleDateString("ru-RU", {weekday: "long", day: "numeric", month: "short", year: "numeric"}) : new Date(data.current.time).toLocaleDateString("ru-RU", {weekday: "long", day: "numeric", month: "short", year: "numeric"})
    currentDay.textContent = day[0].toUpperCase() + day.replace("г.", "").slice(1)
    
    currentDegree.textContent = `${Math.round(degree)}°`
    currentApparentTemp.textContent = `${Math.round(apparentTemp)}°`
    currentHumidity.textContent = `${humidity}%`
    currentWind.textContent = `${Math.round(wind)} м/c`
    currentPrecipitation.textContent = `${Math.round(precipitation)} мм`
}

function renderDailyWeather(data) {
    dailyItems.replaceChildren()
    data.daily.time.forEach(function(date, index) {
        const codeIcon = data.daily.weather_code[index]

        const li = document.createElement("li")
        const button = document.createElement("button")
        const spanLabel = document.createElement("span")
        const img = document.createElement("img")
        const div = document.createElement("div")
        const spanMax = document.createElement("span")
        const spanMin = document.createElement("span")

        li.classList.add("daily__item")

        li.dataset.date = date

        button.classList.add("daily__button")
        spanLabel.classList.add("daily__label")
        img.classList.add("daily__icon")
        div.classList.add("daily__degrees")
        spanMax.classList.add("daily__max")
        spanMin.classList.add("daily__min")
        button.type = "button"
        img.setAttribute("src", getWeatherIcone(codeIcon))

        spanLabel.textContent = new Date(date).toLocaleDateString("ru-RU", {weekday: "short"})
        spanMax.textContent = `${Math.round(data.daily.temperature_2m_max[index])}°`
        spanMin.textContent = `${Math.round(data.daily.temperature_2m_min[index])}°`

        div.append(spanMax, spanMin)
        button.append(spanLabel, img, div)
        li.append(button)
        dailyItems.append(li)
    })
}

dailyItems.addEventListener("click", function(event) {
    const dayItem = event.target.closest(".daily__item");
    if (!dayItem) return;

    dailyItems.querySelectorAll(".daily__item").forEach(function(item) {
        item.querySelector(".daily__button").classList.toggle("daily__button--selected", item === dayItem)
    })
    const date = dayItem.dataset.date;
    renderCurrentWeather(weatherData, date)
    renderHourly(weatherData, date)
})


function renderHourly(data, date) {
    hourlyItems.replaceChildren()

    let indStartHour
    if (date == null) {
        indStartHour = data.hourly.time.indexOf(`${data.current.time.slice(0, 14)}00`)
    } else {
        indStartHour = data.hourly.time.indexOf(`${date}T00:00`)
    }
    const indEndHour = indStartHour + 24
    
    for (let i=indStartHour; i<=indEndHour; i++) {
        const li = document.createElement("li")
        const div = document.createElement("div")
        const img = document.createElement("img")
        const spanTime = document.createElement("span")
        const spanDegree = document.createElement("span")

        const codeIcon = data.hourly.weather_code[i]

        li.classList.add("hourly__item")
        div.classList.add("hourly__info")
        img.classList.add("hourly__icon")
        spanTime.classList.add("hourly__time")
        spanDegree.classList.add("hourly__degree")

        img.setAttribute("src", getWeatherIcone(codeIcon))
        spanTime.textContent = `${data.hourly.time[i].slice(11, 14)}00`
        spanDegree.textContent = `${Math.round(data.hourly.temperature_2m[i])}°`

        div.append(img, spanTime)
        li.append(div, spanDegree)
        hourlyItems.append(li)
    }   
}

async function init(city) {
    weatherData = await getWeather(city.latitude,city.longitude, units
    )

    currentCity.textContent = `${city.name}, `
    currentCountry.textContent = city.country

    renderCurrentWeather(weatherData)
    renderDailyWeather(weatherData)
    renderHourly(weatherData)
    
    console.log(city)
    console.log(weatherData)

}


