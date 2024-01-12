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
        let person = clonedRow.querySelector('.person');
        let GidName = clonedRow.querySelector('.GidName');
        let StudentName = clonedRow.querySelector('.StudentName');

        route.textContent = data[i].route_id;
        person.textContent = data[i].persons;
        GidName.textContent = data[i].guide_id;
        StudentName.textContent = data[i].student_id;


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
            parseData(data); 
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
// ------------------------------------------------Кнопка для выбранного Заказа----------------------------------------------------
let chosenRoute = new Set();
document.querySelector('.fillbody').addEventListener('click', function (event) {
    // Проверка, что клик был по кнопке
    if (event.target.tagName === 'BUTTON') {
        // Получение родительской строки (tr)
        let row = event.target.closest('tr');

        // Получение значения атрибута data-id из строки
        let dataId = row.getAttribute('data-id');
        document.querySelector('.choose').addEventListener('click', function (event) {
            // Проверка, что клик был по кнопке
            if (event.target.tagName === 'BUTTON') {
        let url = `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders?api_key=${apiKey}`;
        let res = requests(url, dataId, "DELETE");
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
            //console.log(dataId);
            }
        })
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
            .catch(error => {
                console.error('Ошибка при выполнении запроса:', error.message);
                msgFromServer(`Ошибка при выполнении запроса: ${error.message}`, "alert-danger");});
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
window.onload = function () {
    getMainTable();

};