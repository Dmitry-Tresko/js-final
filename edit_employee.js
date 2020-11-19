import companyArr from './company.json';
import emplDoings from './employees_doings';

if (!localStorage.getItem('company')) {
    localStorage.setItem('company', JSON.stringify(companyArr));
}

let company = JSON.parse(localStorage.getItem('company'));

const submitBtn = document.getElementById('submit-form');
const formEl = document.getElementsByTagName('form')[0];

const selectorEl = document.querySelector('#dept-select');

const supportedTypes = ['text', 'tel', 'number'];

const validator = {
    text(value) {
        return (/^[a-zA-Z]{3,}(?: [a-zA-Z]+){0,2}$/).test(value);
    },
    tel(value) {
        return (/^[2-9]\d{2}-\d{3}-\d{4}$/).test(value);
    },
    number(value) {
        return (/^$|^[0-9]{1,15}$/).test(value);
    }
}

function hasError({ name, value: originalValue, type, required }) {
    const value = originalValue.trim ? originalValue.trim() : originalValue;

    if (!supportedTypes.includes(type)) {
        return 'Type is not supported'
    }

    if (!value) {
        return required ? `Field "${name}" must be filled necessarily` : false;
    }

    if (validator[type] && !validator[type](value)) {
        return `Field "${name}" is incorrect`;
    }

    return false;
}

function getUserIdFromRequestStr() {
    const requestString = location.search.substring(1);
    const requestArr = requestString.split('=');

    const idIdx = requestArr.findIndex(param => param === 'id');
    const userID = requestArr[idIdx + 1];

    return userID || null;
}

const employeeID = getUserIdFromRequestStr();
let selectedEmployee = null;

if (employeeID) {
    selectedEmployee = emplDoings.getEmployees(employeeID);

    for (let key in selectedEmployee) {
        const el = document.getElementsByName(key)[0];

        if (el) {
            el.value = selectedEmployee[key];
        }
    }
}

for (let i = 1; i < company.length; i++) {
    const optionEl = document.createElement('option');
    const { id, name: companyName } = company[i];
    optionEl.value = id;
    optionEl.innerText = companyName;
    selectorEl.appendChild(optionEl);

    if (selectedEmployee.dept_id == optionEl.value) {
        optionEl.selected = 'selected';
    }
}

submitBtn.addEventListener('click', event => {
    event.preventDefault();

    const inputEl = formEl.getElementsByTagName('input');

    const newInfoOfEmployee = {};

    try {

        for (let i = 0; i < inputEl.length; i++) {
            const { name, value, type, required } = inputEl[i];
            const error = hasError({ name, value, type, required });


            if (error) {
                throw Error(error);
            }

            newInfoOfEmployee[name] = value;
        }

        const updatedEmployee = {
            ...selectedEmployee,
            ...newInfoOfEmployee,
            dept_id: selectorEl.value
        };

        if (selectedEmployee) {
            emplDoings.updateEmployee(employeeID, updatedEmployee);
        }

        return window.location = '/';
    }
    catch (error) {
        alert(error);
    }
})