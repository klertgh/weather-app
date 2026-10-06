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
const hourlyItems = document.querySelectorAll(".hourly__item")



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

function renderHourly(data) {
    hourlyItems.forEach(function(item, index) {
        const hourlyIcon = item.querySelector(".hourly__icon")
        const hourlyTime = item.querySelector(".hourly__time")
        const hourlyTemp = item.querySelector(".hourly__degree")

        hourlyTime.textContent = data.hourly.time[index].slice(11, 16)
        hourlyTemp.textContent = `${Math.round(data.hourly.temperature_2m[index])}°`
    })
    
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
