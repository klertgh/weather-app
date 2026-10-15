import { getWeather } from "./api.js"
import { getLocation } from "./api.js"

let weatherData = null

const unitsBtn = document.querySelector(".units__button")
const unitsList = document.querySelector(".units__list")
const unitName = document.querySelector(".units__item--name")
const unitBtns = unitsList.querySelectorAll("[data-unit][data-value]")
let isUnitsOpen = false
const units = {temperature: "celsius", wind: "kmh", rainfall: "mm"}

const searchForm = document.querySelector(".search")
const searchInput = document.querySelector(".search__input")
const searchSuggestions = document.querySelector(".search__suggestions")
let isSearchSuggestions = false

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

function updateSelectedUnits() {
    unitBtns.forEach(function(unitBtn) {
        const unit = unitBtn.dataset.unit
        const value = unitBtn.dataset.value

        const isSelected = units[unit] === value
        unitBtn.parentElement.classList.toggle("units__item--selected", isSelected)
    })
}

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

searchInput.addEventListener("input", async function(event) {
    const valueSearch = searchInput.value.trim()
    if (valueSearch.length < 3) {
        searchSuggestions.replaceChildren()
        return
    }
    searchSuggestions.classList.toggle("search__suggestions--open", true)
    let suggestions = await getLocation(valueSearch)
    renderSearchHint(suggestions)
    console.log(suggestions)
})

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
        units.wind = "kmh"
        units.rainfall = "mm"
    }

    if (unit&&value) {
        units[unit]=value
    }
    
    updateSelectedUnits()
})

// ИСПРАВИТЬ ВЫЗОВ init
searchForm.addEventListener("submit", function(event) {
    event.preventDefault()
    const cityName = searchInput.value.trim()
    init(cityName)
    
})

function renderCurrentWeather(wData, city) {

    const codeIcon = wData.current.weather_code
    currentIcon.setAttribute("src", getWeatherIcone(codeIcon))
    const day = new Date(wData.current.time).toLocaleDateString("ru-RU", {weekday: "long", day: "numeric", month: "short", year: "numeric"})
    currentDay.textContent = day[0].toUpperCase() + day.replace("г.", "").slice(1)
    
    currentCity.textContent = `${city.name}, `
    currentCountry.textContent = city.country
    currentDegree.textContent = `${Math.round(wData.current.temperature_2m)}°`
    currentApparentTemp.textContent = `${Math.round(wData.current.apparent_temperature)}°`
    currentHumidity.textContent = `${wData.current.relative_humidity_2m}%`
    currentWind.textContent = `${Math.round(wData.current.wind_speed_10m)} км/ч`
    currentPrecipitation.textContent = `${wData.current.precipitation} мм`
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

//беру день недели из ежедневного списка
dailyItems.addEventListener("click", function(event) {
    const dayItem = event.target.closest(".daily__item");
    if (!dayItem) return;

    const date = dayItem.dataset.date;
    renderSelectedDay(weatherData, date)
})

function renderSelectedDay(data, date) {
    const index = weatherData.daily.time.indexOf(date)
    if (index === -1) return

    const codeIcon = data.daily.weather_code[index]
    currentIcon.setAttribute("src", getWeatherIcone(codeIcon))
    currentDegree.textContent = `${Math.round(data.daily.temperature_2m_mean[index])}°`
    currentApparentTemp.textContent = `${Math.round(data.daily.apparent_temperature_mean[index])}°`
    currentHumidity.textContent = `${data.daily.relative_humidity_2m_mean[index]}%`
    currentWind.textContent = `${Math.round(data.daily.wind_speed_10m_mean[index])} км/ч`
    currentPrecipitation.textContent = `${data.daily.precipitation_sum[index]} мм`

    const day = new Date(date).toLocaleDateString("ru-RU", {weekday: "long", day: "numeric", month: "short", year: "numeric"})
    currentDay.textContent = day[0].toUpperCase() + day.replace("г.", "").slice(1)

}


function renderHourly(data) {
    hourlyItems.replaceChildren()
    
    const currentHour = `${data.current.time.slice(0, 14)}00`
    const indStartHour = data.hourly.time.indexOf(currentHour)
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
    renderCurrentWeather(weatherData, city)
    renderDailyWeather(weatherData)
    renderHourly(weatherData)
    
    
    console.log(city)
    console.log(weatherData)

}


