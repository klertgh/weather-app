import { getWeather } from "./api.js"

const unitsBtn = document.querySelector(".units__button")
const unitsList = document.querySelector(".units__list")
const unitName = document.querySelector(".units__item--name")
const unitBtns = unitsList.querySelectorAll("[data-unit][data-value]")
let isUnitsOpen = false
const units = {temperature: "celsius", wind: "kmh", rainfall: "mm"}

const currentIcon = document.querySelector(".today__icon")
const currentTemp = document.querySelector(".today__degrees")
const currentApparentTemp = document.querySelector("#feels")
const currentHumidity = document.querySelector('#humidity')
const currentWind = document.querySelector('#wind')
const currentPrecipitation = document.querySelector('#precipitation')

const dailyItems = document.querySelectorAll(".daily__item")
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


function updateSelectedUnits() {
    unitBtns.forEach(function(unitBtn) {
        const unit = unitBtn.dataset.unit
        const value = unitBtn.dataset.value

        const isSelected = units[unit] === value
        unitBtn.parentElement.classList.toggle("units__item--selected", isSelected)
    })
}

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

function renderCurrentWeather(data) {
    currentTemp.textContent = `${Math.round(data.current.temperature_2m)}°`
    currentApparentTemp.textContent = `${Math.round(data.current.apparent_temperature)}°`
    currentHumidity.textContent = `${data.current.relative_humidity_2m}%`
    currentWind.textContent = `${data.current.wind_speed_10m} км/ч`
    currentPrecipitation.textContent = `${data.current.precipitation} мм`
}

function renderDailyWeather(data) {
    dailyItems.forEach(function(item, index) {
        const dailyIcon = item.querySelector(".daily__icon")
        const dailyMax = item.querySelector(".daily__max")
        const dailyMin = item.querySelector(".daily__min")
        
        dailyMax.textContent = `${Math.round(data.daily.temperature_2m_max[index])}°`
        dailyMin.textContent = `${Math.round(data.daily.temperature_2m_min[index])}°`
    })
}

function getWeatherIcone(code) {
    for (const group of Object.values(weatherIcons)) {
        if (group.codes.includes(code)) {
            return group.src
        }
    }
}

function renderHourly(data) {
    const currentHour = data.current.time.slice(0, 14)+"00"
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
        spanTime.textContent = data.hourly.time[i].slice(11, 14)+"00"
        spanDegree.textContent = Math.round(data.hourly.temperature_2m[i])

        div.append(img, spanTime)
        li.append(div, spanDegree)

        hourlyItems.append(li)
    }   
}


async function init() {
    const weatherData = await getWeather(
        52.52,
        13.41,
        units
    )
    renderCurrentWeather(weatherData)
    renderDailyWeather(weatherData)
    renderHourly(weatherData)

}

init()
