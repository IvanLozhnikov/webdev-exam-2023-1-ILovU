'use strict';
//-------------------------------------------------BOOTSTRAP----------------------------------------------------------

//-------------------------------------------------MAP----------------------------------------------------------

let map;

DG.then(function () {
    map = DG.map('map', {
        center: [ 55.75, 37.62],
        zoom: 13,
    });

    DG.marker([55.75, 37.62]).addTo(map).bindPopup('Вы кликнули по мне!');
});
//-------------------------------------------------MAP----------------------------------------------------------
let apiKey = "7682cf7d-a51f-4eef-bf3b-f9b20efb1201";
function saveToSessionStorage(data) {

    sessionStorage.setItem("data", JSON.stringify(data));

}
let getRequestMainTable = async function (url, method) {
    if (method == 'GET') {
        return await fetch(url, { });
    }
};
// --------------------------------------------------------таблица с гидами---------------------------------------------------------------
function getGidTable(id) {
   
    let url = "http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes/"
    let cur_url = new URL(`${url}${id}/guides?api_key=${apiKey}`);
    getRequestMainTable(cur_url, 'GET')
        .then((data) => {
            return data.json();
        })
        .then((data) => {
            fillGitTable(data);
            fillSelectlang(data);
        }
        )
        .catch(error => console.error(`Something went wrong: ${error}`));

}
//   ДЛЯ ОПРЕДЕЛЕНИЯ ГОД/ЛЕТ/ГОДА
function plural(number, titles) {
    let cases = [2, 0, 1, 1, 1, 2];
    return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
}

let declension = ['год', 'года', 'лет'];
//-------------------------------------------------
let BdForLang = new Set();
function fillSelectlang(data) {
    //console.log(BdForLang)
    let sessionDb = new Set();

    for (let i = 0; i < data.length; i++) {
        sessionDb.add(data[i].language);
    }

    let selectLang = document.querySelector('.lang-gid');


    selectLang.innerHTML = "";


    let header = document.createElement('option');
    header.setAttribute("disabled", true);
    header.setAttribute("selected", true);
    header.textContent = "Выбрать язык";
    selectLang.appendChild(header);

    for (let lang of sessionDb) {
        if (BdForLang.has(lang)) {
            console.log(lang);
        } else {
            BdForLang.add(lang);
        }
    }

    BdForLang.forEach(value => {
        let newOption = document.createElement('option');
        newOption.value = value;
        newOption.textContent = value;
        selectLang.append(newOption);
    });
}
function fillGitTable(data) {
    let tableBody = document.querySelector('.gid-fillbody');
    let template = document.querySelector('.template-row-gid');

    for (let i = 0; i < data.length; i++) {
        let clonedRow = template.content.cloneNode(true);

        let id = clonedRow.querySelector('.id-git-route');
        let Fio = clonedRow.querySelector('.FIO');
        let language = clonedRow.querySelector('.language');
        let workExperience = clonedRow.querySelector('.workExperience');
        let PricePerHour = clonedRow.querySelector('.PricePerHour');

        id.textContent = data[i].id;
        id.setAttribute('data-route-id', data[i].route_id);
        Fio.textContent = data[i].name;
        let pluralDetect = plural(data[i].workExperience, declension);
        workExperience.textContent = data[i]
            .workExperience + ` ${pluralDetect}`;
        language.textContent = data[i].language;
        PricePerHour.textContent = data[i].pricePerHour + " ₽";

        tableBody.appendChild(clonedRow);
    }
}


function DeleteGid(routeId, method) {
    let table = document.querySelector(".gid-fillbody");
    let currentRouteId = table.querySelectorAll(".id-git-route");

    for (const route of currentRouteId) {

        let route2 = route.getAttribute('data-route-id');

        if (route2 == routeId) {
            route.closest('tr').remove();
        }
    }


}

//-------------------------------------------------Добавление Записей----------------------------------------------------------
function fillTable(data) {
    let tableBody = document.querySelector('.fillbody');
    let template = document.querySelector('.template-row');
    tableBody.textContent = "";
    if (data == "netdanix") {
        return;
    }
    for (let i = 0; i < data.length; i++) {
        let clonedRow = template.content.cloneNode(true);
        let tr = clonedRow.querySelector("#id-tr");
        tr.setAttribute('data-id', `${JSON.stringify(data[i].id)}`);
        let route = clonedRow.querySelector('.route');
        let desc = clonedRow.querySelector('.desc');
        let mainObjects = clonedRow.querySelector('.mainObjects');

        route.textContent = data[i].name;
        desc.textContent = data[i].description;
        mainObjects.textContent = data[i].mainObject;

        tableBody.appendChild(clonedRow);
    }

}
let parse = [];
let currentPage = 0;
function parseData(data) {
    parse = [];
    currentPage = 0;
    let result = [];
    for (let i = 0; i < data.length; i++) {
        if (result.length == 5) {
            parse.push(result);
            result = [];
        } else {
            result.push(data[i]);
        }
    }
    parse.push(result);
    updateContent();

}


let pagBtns = document.querySelector('.pagination-btn');

pagBtns.addEventListener('click', paginationBtnActived);

function paginationBtnActived(event) {
    if (event.target.textContent === "Далее") {
        if (currentPage < parse.length - 1) {
            currentPage++;
            updateContent();
        }
    } else if (event.target.textContent === "Назад") {
        if (currentPage > 0) {
            currentPage--;
            updateContent();
        }
    } else

        // Обновление состояния кнопок
        updateButtonsState();

}

function updateContent() {

    //console.log('Обновление содержимого для страницы', currentPage);
    fillTable(parse[currentPage]);
}
// ---------------------------------ONLY NEXT OR PREV BUTTONS------------------------------------ 
function updateButtonsState() {
    // Обновление состояния кнопок
    let nextBtn = document.querySelector('.btn-next');
    let prevBtn = document.querySelector('.btn-prev');

    if (currentPage === 0) {
        prevBtn.classList.add('disabled');
    } else {
        prevBtn.classList.remove('disabled');
    }

    if (currentPage === parse.length - 1) {
        nextBtn.classList.add('disabled');
    } else {
        nextBtn.classList.remove('disabled');
    }
}


//-------------------------------------------------Добавление Записей----------------------------------------------------------

function getMainTable() {
    let url = `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes?api_key=${apiKey}`;
    getRequestMainTable(url, 'GET')
        .then((data) => {
            return data.json();
        })
        .then(data => {
            parseData(data); addHint(data);

            saveToSessionStorage(data);
        }
        )
        .catch(error => console.error(`Something went wrong: ${error}`));
}
//--------------------------------------------------SEARCHROUTEBLOCK----------------------------------------------------------
let filterBtn = document.querySelector('.search-btn');
function searchFromBtn() {
    let inputValue = document.querySelector('#input-for-search').value;
    let data = JSON.parse(sessionStorage.getItem('data'));
    if (inputValue == "") {
        console.log("Input field is empty");
        parseData(data);
    }
    else {
        let newData = [];
        for (let i = 0; i < data.length; i++) {
            if (data[i].name == inputValue) {
                newData.push(data[i]);
            }
        }
        if (newData.length == 0) {
            let activateMsg = document.querySelector(".alert-msg");
            activateMsg.classList.remove("d-none");
            setTimeout(() => activateMsg.classList.add("d-none"), 2000);
        }
        else {
            parseData(newData);
        }
    }
}
// ------------------------------------------------Кнопка для выборанного маршрута----------------------------
let chosenRoute = new Set();
document.querySelector('.fillbody').addEventListener('click', function (event) {
    // Проверка, что клик был по кнопке
    if (event.target.tagName === 'BUTTON') {
        // Получение родительской строки (tr)
        let row = event.target.closest('tr');

        // Получение значения атрибута data-id из строки
        let dataId = row.getAttribute('data-id');


        //console.log('Кнопка в строке с data-id ' + dataId + ' была нажата.');
        if (chosenRoute.has(dataId)) {
            DeleteGid(dataId, 'deluseroute');
            chosenRoute.delete(dataId);

            if (chosenRoute.size == 0) {
                let delElem = document.querySelector('.chosen-gids');
                delElem.classList.remove('d-none');


            }
            //console.log(chosenRoute);

        } else {
            chosenRoute.add(dataId);
            if (chosenRoute.size > 0) {
                let delElem = document.querySelector('.chosen-gids');
                delElem.classList.add('d-none');


            }
            getGidTable(dataId);
            //console.log(chosenRoute);
        }

    }

});
// ------------------------------------------------Кнопка для выборанного маршрута----------------------------


filterBtn.addEventListener('click', searchFromBtn);
function addHint(data) {
    let getData = document.querySelector('#routes-list');
    for (let i = 0; i < data.length; i++) {
        let string = document.createElement('option');
        string.textContent = data[i].name;
        getData.append(string);
    }
}
// ------------------------------------------------СЕКЦИЯ ДЛЯ ВЫБОРА ЯЗЫКА ГИДА----------------------------------------------------------- 
let body = document.querySelector('.gid-fillbody');
let elems;
function hideElement(element) {
    if (!element.classList.contains('d-none')) {
        element.classList.add('d-none');
    }
}

function showElement(element) {
    let delElem = document.querySelector('.chosen-gids');
    delElem.classList.add('d-none');
    if (element.classList.contains('d-none')) {
        element.classList.remove('d-none');
    }
}
document.querySelector('.lang-gid').addEventListener('change', (e) => {
    let value = e.target.value;
    elems = body.querySelectorAll('.git-table');
    let foundResults = false;  // Флаг, указывающий, были ли найдены результаты

    for (let i = 0; i < elems.length; i++) {
        let langGid = elems[i].querySelector('.language').textContent;
        if (langGid === value) {
            showElement(elems[i]);
            foundResults = true;
        } else {
            hideElement(elems[i]);
        }
    }

    // Проверяем, были ли найдены результаты
    if (!foundResults) {
        console.log('Нет результатов для выбранного языка.');
        let delElem = document.querySelector('.chosen-gids');
        delElem.classList.remove('d-none');
    }
});
// ------------------------------------------------ОБРАБОТЧИК ДЛЯ ПЕЧАТИ ОПЫТ РАБОТЫ---------------------------------------------------------- 
const workContainer = document.querySelector('.opit-raboty');
let container;

workContainer.addEventListener("change", (e) => {
    let firstValue = e.target.value;
    if (e.target.classList.contains()) {

    }
});


// ------------------------ВСЕ ЧТО СВЯЗАНО С ОТПРАВКОЙ ФОРМЫ НА СЕРВЕР + ОБЩАЯ ФУНКЦИЯ ДЛЯ ВСЕХ ТИПОВ ЗАПРОСА---------------------------------
function msgFromServer(msg, alertType) {
    let field = document.querySelector(".msg-from-server");
    let alertElement = document.querySelector(".msg-from2");
    let message = field.querySelector(".main-msg");

    if (alertType === "alert-success" || alertType === "alert-danger") {
        field.classList.remove("d-none");
        alertElement.classList.add(alertType);
        message.textContent = msg;

        setTimeout(() => {
            field.classList.add("d-none");
            alertElement.classList.remove(alertType);
        }, 2000);
    }
}

async function requests(url, data, method) {
    if (method == "POST") {
        return await fetch(url, {
            method: method,
            body: data
        })
            .then(response => {
                return response.json();
            }).catch(error => {
                console.error('Ошибка при выполнении запроса:', error.message);
                msgFromServer(`Ошибка при выполнении запроса: ${error.message}`, "alert-danger");
            });
    } else if (method == "GET") {
        return await fetch(url)
            .then(Response => Response.json())
            .catch((e) => console.log("Error in " + method));
    } else if (method == "PUT") {
        return await fetch(url, {
            method: method,
            body: data
        })
            .then(Response => Response.json())
            .catch((e) => console.log("Error in " + method));
    } else if (method == "DELETE") {
        return await fetch(url, {
            method: method,
            body: data
        })
            .then(Response => Response.json())
            .catch((e) => console.log("Error in " + method));
    }
}
// ----------------------------------------MODAL WINDOW TO SEND-------------------------------------------------------
function getRouteNameById(data) {
    let local = JSON.parse(sessionStorage.getItem('data'));
    console.log(local[5].name);
    for (let i = 0; i < local.length; i++) {
        if (local[i].id == data) {
            console.log(local[i].name);
            return local[i].name;
        }
    }
}
let globalPrice = 0;
document.querySelector('.gid-fillbody').addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        // Получение родительской строки (tr)

        let row = e.target.closest('tr');

        // --------------------------------------------получение данных из строки-------------------------------------------------
        let gidId = row.querySelector('.id-git-route');
        let routeId = gidId.getAttribute('data-route-id');
        let gidName = row.querySelector('.FIO');
        let routeName = getRouteNameById(Number(routeId));
        // --------------------------------------------ОБНОВИТЬ И СБРОС ДЛЯ КАЖДОЙ СТРОКИ-------------------------------------------------
        let duration = document.querySelector(".one");
        duration.selected = true;
        document.querySelector('#flexCheckDefault').checked = false;
        let peopleCount = document.querySelector('.people-amount');
        peopleCount.value = 1;
        let gidPrice = row.querySelector(".PricePerHour");
        // --------------------------------------------получение данных из модального окна + textcontent-------------------------------------------------
        let fioField = document.querySelector('.gid-name');
        fioField.setAttribute("id", `${gidId.textContent}`);
        fioField.textContent = gidName.textContent;
        let routeField = document.querySelector('.excursion-name');
        routeField.setAttribute("id", `${routeId}`);
        routeField.textContent = routeName;
        let nadbavka = document.querySelector('.option-discount');
        nadbavka.textContent = 0 + " ₽";
        let price = document.querySelector('.excursion-price');
        price.textContent = gidPrice.textContent;
        globalPrice = parseInt(gidPrice.textContent);

        const addEventElement = document.querySelector('.add-event');
        const changeEvent = new Event('change', { bubbles: true });
        addEventElement.dispatchEvent(changeEvent);

        //console.log('Кнопка в строке с data-id ' + dataId + ' была нажата.');

    }
});


//--------------------------------------------------УСЛОВИИ ДЛЯ МОДАЛЬНОГО ОКНА ----------------------------------------------------------
function conditionOfModalForm() {
    //---------------DATE-------------------
    function addDays(date, days) {
        let newDate = new Date(date);
        newDate.setDate(newDate.getDate() + days);
        return newDate;
    }

    function addMonths(date, months) {
        let newDate = new Date(date);
        newDate.setMonth(newDate.getMonth() + months);
        return newDate;
    }

    let dateInput = document.querySelector('.datepicker');
    let tomorrow = addDays(new Date(), 1);
    let tomorrowString = tomorrow.toISOString().split('T')[0];

    let threeMonthsFromTomorrow = addMonths(tomorrow, 3);
    let threeMonthsFromTomorrowString = threeMonthsFromTomorrow.toISOString().split('T')[0];

    dateInput.setAttribute("value", tomorrowString);
    dateInput.setAttribute("min", tomorrowString);
    dateInput.setAttribute("max", threeMonthsFromTomorrowString);


    // console.log(todayString, endDateString);

    //---------------CLOCK-------------------
}
// ------------------------------------------------Добовляем прослушку эвентов для элементов полей---------------------------------------------------------- 
function isEndOfWeek(date) {
    const endweeks = [
      //январь------------------февраль-----------------март--------------------апрель------------------май---------------------июнь--------------------июль--------------------август------------------сентябрь----------------октябрь-----------------ноябрь------------------декабрь
        new Date('2024-01-06'), new Date('2024-02-03'), new Date('2024-03-02'), new Date('2024-04-06'), new Date('2024-05-04'), new Date('2024-06-01'), new Date('2024-07-06'), new Date('2024-08-03'), new Date('2024-09-01'), new Date('2024-10-05'), new Date('2024-11-02'), new Date('2024-12-01'),
        new Date('2024-01-07'), new Date('2024-02-04'), new Date('2024-03-03'), new Date('2024-04-07'), new Date('2024-05-05'), new Date('2024-06-02'), new Date('2024-07-07'), new Date('2024-08-04'), new Date('2024-09-07'), new Date('2024-10-06'), new Date('2024-11-03'), new Date('2024-12-07'),
        new Date('2024-01-13'), new Date('2024-02-10'), new Date('2024-03-09'), new Date('2024-04-13'), new Date('2024-05-11'), new Date('2024-06-08'), new Date('2024-07-13'), new Date('2024-08-10'), new Date('2024-09-08'), new Date('2024-10-12'), new Date('2024-11-09'), new Date('2024-12-08'),
        new Date('2024-01-14'), new Date('2024-02-11'), new Date('2024-03-10'), new Date('2024-04-14'), new Date('2024-05-12'), new Date('2024-06-09'), new Date('2024-07-14'), new Date('2024-08-11'), new Date('2024-09-14'), new Date('2024-10-13'), new Date('2024-11-10'), new Date('2024-12-14'),
        new Date('2024-01-20'), new Date('2024-02-17'), new Date('2024-03-16'), new Date('2024-04-20'), new Date('2024-05-18'), new Date('2024-06-15'), new Date('2024-07-20'), new Date('2024-08-17'), new Date('2024-09-15'), new Date('2024-10-19'), new Date('2024-11-16'), new Date('2024-12-15'),
        new Date('2024-01-21'), new Date('2024-02-18'), new Date('2024-03-17'), new Date('2024-04-21'), new Date('2024-05-19'), new Date('2024-06-16'), new Date('2024-07-21'), new Date('2024-08-18'), new Date('2024-09-21'), new Date('2024-10-20'), new Date('2024-11-17'), new Date('2024-12-21'),
        new Date('2024-01-27'), new Date('2024-02-24'), new Date('2024-03-23'), new Date('2024-04-27'), new Date('2024-05-25'), new Date('2024-06-22'), new Date('2024-07-27'), new Date('2024-08-24'), new Date('2024-09-22'), new Date('2024-10-26'), new Date('2024-11-23'), new Date('2024-12-22'),
        new Date('2024-01-28'), new Date('2024-02-25'), new Date('2024-03-24'), new Date('2024-04-28'), new Date('2024-05-26'), new Date('2024-06-23'), new Date('2024-07-28'), new Date('2024-08-25'), new Date('2024-09-28'), new Date('2024-10-27'), new Date('2024-11-24'), new Date('2024-12-28'),
                                                        new Date('2024-03-30'),                                                 new Date('2024-06-29'),                         new Date('2024-08-31'), new Date('2024-09-29'),                         new Date('2024-11-30'), new Date('2024-12-29'),
                                                        new Date('2024-03-31'),                                                 new Date('2024-06-30'),
    ];
    for (const endweek of endweeks) {
        if (date.toISOString().split('T')[0] == endweek.toISOString().split('T')[0] || date.getDay() == 6 || date.getDay() == 0) {
            console.log('Сегодня выходной!');
            return true;
        }
    }
    return false;
}
function calculatePrice(guideServiceCost, hoursNumber, isThisDayOff, isItMorning, isItEvening, numberOfVisitors, nadbavka, optionOne, optionTwo, isThisWeekEnd) {
    let basePrice = guideServiceCost * hoursNumber * isThisDayOff;
    let morningSurcharge = isItMorning ? 400 : 0;
    let eveningSurcharge = isItEvening ? 1000 : 0;
    let visitorsSurcharge = 0;

    if (numberOfVisitors >= 1 && numberOfVisitors <= 5) {
        visitorsSurcharge = 0;
    } else if (numberOfVisitors > 5 && numberOfVisitors <= 10) {
        visitorsSurcharge = 1000;
    } else if (numberOfVisitors > 10 && numberOfVisitors <= 20) {
        visitorsSurcharge = 1500;
    }

    let totalPrice = basePrice + morningSurcharge + eveningSurcharge + visitorsSurcharge;
    if (optionOne == true && isThisWeekEnd == false) {
        let res = ((totalPrice + nadbavka) * 30) / 100;
        totalPrice += res;
    }
    if (optionOne == true && isThisWeekEnd == true) {
        let res = ((totalPrice + nadbavka) * 25) / 100;
        totalPrice += res;
    }
    if (optionTwo == true) {
        let res = (((totalPrice + nadbavka) * 15) / 100)*(-1);
        totalPrice += res;
    }
    return Math.round(totalPrice + nadbavka);
}
function changePrice(sum, nadbavka) {
    let guideServiceCost = document.querySelector('.excursion-price');
    guideServiceCost.textContent = sum + " ₽";

    let nadbavkaElement = document.querySelector('.option-discount');
    nadbavkaElement.textContent = nadbavka + " ₽";
}
function isHoliday(date) {
    const holidays = [
        new Date('2024-01-01'), // Новый год
        new Date('2024-03-08'), // Международный женский день
        new Date('2024-05-01'), // Праздник труда
        new Date('2024-05-09'), // День Победы
        new Date('2024-06-12'), // День России
        // далее по усмотрению
    ];
    for (const holiday of holidays) {
        if (date.toISOString().split('T')[0] == holiday.toISOString().split('T')[0] || date.getDay() == 6 || date.getDay() == 0) {
            console.log('Сегодня праздничный день!');
            return true;
        }
    }
    return false;
}
function hourToMinute(hour) {
    let arr = hour.split(":");
    return Number(arr[0] * 60) + Number(arr[1]);
}
function isMorning(time) {
    let timeStart = new Date('2000-01-01T09:00').toISOString().split('T')[1];
    timeStart = hourToMinute(timeStart);
    let timeEnd = new Date('2000-01-01T12:00').toISOString().split('T')[1];
    timeEnd = hourToMinute(timeEnd);
    time = hourToMinute(time.toISOString().split('T')[1]);
    if (timeStart <= time && time <= timeEnd) {
        return true;
    }
    return false;
}
function isEvening(time) {
    let timeStart = new Date('2000-01-01T20:00').toISOString().split('T')[1];
    timeStart = hourToMinute(timeStart);
    let timeEnd = new Date('2000-01-01T23:00').toISOString().split('T')[1];
    timeEnd = hourToMinute(timeEnd);
    time = hourToMinute(time.toISOString().split('T')[1]);
    if (timeStart <= time && time <= timeEnd) {
        return true;
    }
    return false;
}
let optionOne = false;
let optionTwo = false;
document.querySelector('.add-event').addEventListener('change', () => {

    let day = document.querySelector(".datepicker").value;
    let hoursNumber = document.querySelector('.hours-selected').value;
    let countExcurs = document.querySelector(".people-amount").value;
    let isOption2 = document.querySelector(".option2")
    if (isOption2.checked) {
        optionOne = true;
    } else {
        optionOne = false;
    }
    let isThisDayOff = false;
    let isThisWeekEnd = false;
    let isItMorning = false;
    let isItEvening = false;
    let nadbavka = 0;
    let sum = 0;
    // -----------------------DAY--------------------
    isThisDayOff = isHoliday(new Date(`${day}`));
    isThisWeekEnd = isEndOfWeek(new Date(`${day}`));
    console.log(day);
    console.log(isThisDayOff);
    // ----------------------DATE AND TIME---------------------
    let date = document.querySelector(".datepicker").value;
    let selectedTime = document.querySelector(".excursion-start").value;
    if (selectedTime == "") {
        let currentDate = new Date();
        currentDate.setMinutes(currentDate.getMinutes() + 30);

        let hours = currentDate.getHours().toString().padStart(2, '0');
        let minutes = currentDate.getMinutes().toString().padStart(2, '0');
        selectedTime = `${hours}:${minutes}`;
    }

    let selectedTimeObj = new Date(`2000-01-01T${selectedTime}`);
    isItEvening = isEvening(selectedTimeObj);
    isItMorning = isMorning(selectedTimeObj);
    console.log(isItEvening);
    // -------------------------------END DATE AND TIME-----------------------
    let optionChecked = document.querySelector(".option-name").checked;
    console.log(optionChecked);
    if (optionChecked) {
        optionTwo = true;} 
    else {
        console.log(optionChecked);
        optionTwo = false;
        }
    countExcurs = document.querySelector(".people-amount").value;
    let holidate = isThisDayOff ? 1.5 : 1;
    sum = calculatePrice(globalPrice, Number(hoursNumber),
        holidate, isItMorning, isItEvening, Number(countExcurs), nadbavka, optionOne, optionTwo, isThisWeekEnd);
    // sum = gui
    changePrice(sum, nadbavka);
});
// ------------------------------------------------КНОПКА SENDREQUEST-----------------------------------------------------------

document.querySelector(".sendRequest").addEventListener("click", () => {
    let formData = new FormData();
    let date = document.querySelector(".datepicker").value;
    let hoursNumber = Number(document.querySelector('.hours-selected').value);
    let countExcurs = Number(document.querySelector(".people-amount").value);
    let price = Math.round(Number(document.querySelector(".excursion-price").textContent.split(" ")[0]));
    let fioField = Number(document.querySelector('.gid-name').getAttribute("id"));
    let routeField = Number(document.querySelector('.excursion-name').getAttribute("id"));
    let selectedTime = document.querySelector(".excursion-start").value;


   
    console.log(`date: ${date}, type: ${typeof date}`);
    console.log(`hoursNumber: ${hoursNumber}, type: ${typeof hoursNumber}`);
    console.log(`countExcurs: ${countExcurs}, type: ${typeof countExcurs}`);
    console.log(`price: ${price}, type: ${typeof price}`);
    console.log(`fioField: ${fioField}, type: ${typeof fioField}`);
    console.log(`routeField: ${routeField}, type: ${typeof routeField}`);
    console.log(`Time: ${selectedTime}, type: ${typeof selectedTime}`);

   
    formData.append('date', date);
    formData.append('duration', hoursNumber);
    formData.append('guide_id', fioField);
    formData.append('optionFirst', optionOne ? 1 : 0);
    formData.append('optionSecond', optionTwo ? 1 : 0);
    formData.append('persons', countExcurs);
    formData.append('price', price);
    formData.append('route_id', routeField);
    formData.append('time', selectedTime);
    let url = `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders?api_key=${apiKey}`;
    let res = requests(url, formData, "POST");
    res.then(data => {
        console.log(data);
        let key = "error"
        let isErr = key in data;
        if (isErr) {
            msgFromServer(`${data.error}`, "alert-danger");
            document.querySelector(".close").click();
        } else {
            
            msgFromServer("Заявка успешно оправлено", "alert-success");
            document.querySelector(".close").click();
        }

    });





  
});

// ------------------------------------------------КНОПКА SENDREQUEST----------------------------------------------------------- 
document.querySelector('#start-time').addEventListener('input', function () {
    let enteredTime = this.value;

    if (/^([0-1]?[0-9]|2[0-3]):(00|30)$/.test(enteredTime)) {
        
        this.dataset.prevValidTime = enteredTime;
    } else {
        
        this.value = this.dataset.prevValidTime || '';
    }
});
window.onload = function () {
    getMainTable();
    conditionOfModalForm();

};
