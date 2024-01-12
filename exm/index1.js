'use strict';
//-------------------------------------------------BOOTSTRAP----------------------------------------------------------
let apiKey = "7682cf7d-a51f-4eef-bf3b-f9b20efb1201";
function saveToSessionStorage(data) {

    sessionStorage.setItem("data", JSON.stringify(data));

}
let getRequestMainTable = async function (url, method) {
    if (method == 'GET') {
        return await fetch(url, {

        });

    }
};

//   ДЛЯ ОПРЕДЕЛЕНИЯ ГОД/ЛЕТ/ГОДА
function plural(number, titles) {
    let cases = [2, 0, 1, 1, 1, 2];
    return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
}

let declension = ['год', 'года', 'лет'];
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
        let SecondObjects = clonedRow.querySelector('.SecondObjects');

        desc.textContent = data[i].persons;
        mainObjects.textContent = data[i].guide_id;
        SecondObjects.textContent = data[i].student_id;
        route.textContent = data[i].route_id;

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
    let url = `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders?api_key=${apiKey}`;
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
            
            //console.log(chosenRoute);
        }

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
