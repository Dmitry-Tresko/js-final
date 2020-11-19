import companyArr from './company.json';
import employeesArr from './employees.json';
import emplDoings from './employees_doings';

if (!localStorage.getItem('company')) {
    localStorage.setItem('company', JSON.stringify(companyArr));
}

if (!localStorage.getItem('employees')) {
    localStorage.setItem('employees', JSON.stringify(employeesArr));
}

let company = JSON.parse(localStorage.getItem('company'));
let employees = JSON.parse(localStorage.getItem('employees'));

let selectedEmployeeTreeItem = null;

const deptIds = [];

employees.forEach(employee => {
    if (!deptIds.includes(employee.dept_id)) {
        deptIds.push(employee.dept_id);
    }
});

function makeTree(originalArr) {
    const arr = stringClone(originalArr);

    for (let i = 0; i < arr.length; i++) {
        const potentialParent = arr[i];

        for (let j = 0; j < arr.length; j++) {
            const potentialChild = arr[j];

            if (potentialParent.id === potentialChild.parent_id) {
                if (!potentialParent.children) potentialParent.children = [];
                potentialParent.children.push(potentialChild);
            }
        }
    }

    return arr.filter(item => item.parent_id === null);
}

function createDOMTree(collection, containerEl) {
    const rootEl = document.createElement('ul');
    buildTree(collection, rootEl);

    containerEl.appendChild(rootEl);
}

function makePreposotion() {
    const iEl = document.createElement('i');
    iEl.classList.add('collapsed');

    return iEl;
}

function buildTree(arr, rootEl) {
    for (let i = 0; i < arr.length; i++) {
        const branchEl = arr[i];

        const liEl = document.createElement('li');
        const spanEl = document.createElement('span');

        if (branchEl.children) liEl.appendChild(makePreposotion());

        spanEl.innerText = branchEl.name;
        spanEl.dataset.deptId = branchEl.id;

        if (!deptIds.includes(branchEl.id)) {
            spanEl.classList.add('disabled-tree-item');
        }

        liEl.appendChild(spanEl);

        rootEl.appendChild(liEl);

        if (branchEl.children) {
            const ulEl = document.createElement('ul');
            liEl.appendChild(ulEl);
            buildTree(branchEl.children, ulEl);
        }
    }
}

const jsTree = makeTree(company);
const containerEl = document.getElementById('branch-container');
createDOMTree(jsTree, containerEl);

const selectorBtn = document.querySelector('#currency-choice');

containerEl.addEventListener('click', event => {
    selectorBtn.value = 'BYN';
    employees = emplDoings.getEmployees();

    if (event.target.tagName === 'SPAN') {
        const filteredEmployees = getEmployeesByDeptId(employees, +event.target.dataset.deptId);

        displayEmployeesData(filteredEmployees);

        selectedTreeItem(event.target);

        return;
    }

    if (event.target.tagName === "I") {
        const elToHide = event.target.parentElement.getElementsByTagName('ul')[0];
        elToHide.classList.toggle('hidden');
    }
})

function stringClone(collection) {
    return JSON.parse(JSON.stringify(collection));
}

function getEmployeesByDeptId(employeesCollection, id) {
    return employeesCollection.filter(employee => employee.dept_id == id);
}

function displayEmployeesData(employees) {
    clearTable();

    const fields = ['id', 'name', 'phone', 'salary', 'deletes'];
    const tBody = getTableBody();

    employees.forEach(employee => {
        const tRow = document.createElement('tr');
        tRow.dataset.employeesId = employees.id;

        for (let i = 0; i < fields.length; i++) {
            const tD = document.createElement('td');
            const fieldName = fields[i];

            if (employee[fieldName] !== undefined) {
                tD.innerText = employee[fieldName];
            }

            if (fieldName === 'salary') {
                tD.dataset.salary = 'salary';
                tD.dataset.originalValue = employee[fieldName];
                tD.classList.add('blured-salary');
            }

            if (fieldName === 'name') {
                tD.classList.add('employee-name-td');
                const nameInfo = `<a href="/edit_employee.html?id=${employee.id}" class="employee-name">${employee[fieldName]}</a>`;
                tD.innerHTML = nameInfo;
            }

            if (fieldName === 'deletes') {
                const deleteBtn = document.createElement('button');
                deleteBtn.innerText = 'Delete employee';
                deleteBtn.classList.add('delete-btn');

                tD.appendChild(deleteBtn);

                deleteBtn.addEventListener('click', event => {
                    const isOk = confirm('Are you sure that you want to delete selected employee?');
                    if (isOk) {
                        emplDoings.deleteEmployee(employee.id);
                        deleteTableRow(event.target);
                    }
                })
            }

            tRow.appendChild(tD);
        }

        tBody.appendChild(tRow);
    })
}

function getTableBody() {
    const tBodyEl = document.getElementsByTagName('tbody')[0];

    if (tBodyEl) return tBodyEl;

    const table = document.getElementsByTagName('table')[0];
    const newTbodyEl = document.createElement('tbody');

    table.appendChild(newTbodyEl);

    return newTbodyEl;
}

const clearTableBtn = document.getElementById('clear-table');
clearTableBtn.addEventListener('click', event => {
    clearTable();
})

function clearTable() {
    const tBody = document.getElementsByTagName('tbody')[0];
    const table = document.getElementsByTagName('table')[0];

    if (tBody) {
        table.removeChild(tBody);
    }
}

function selectedTreeItem(selectedItem) {
    clearTreeSelection();

    selectedEmployeeTreeItem = selectedItem;
    selectedEmployeeTreeItem.classList.add('selected-tree-item');
}

const clearAllBtn = document.getElementById('clear-all');
clearAllBtn.addEventListener('click', event => {
    clearAll();
})

function clearAll() {
    clearTable();
    clearTreeSelection();
}

function clearTreeSelection() {
    if (selectedEmployeeTreeItem)
        selectedEmployeeTreeItem.classList.remove('selected-tree-item');
}

async function getData(curID) {
    try {
        const response = await fetch(`https://www.nbrb.by/api/exrates/rates/${curID}`);
        return response.json();
    }
    catch (e) {
        console.log(e);
    }
}

function convertData(res, employee) {
    const scale = res.Cur_Scale;
    const rate = res.Cur_OfficialRate;

    return ((+employee.dataset.originalValue * scale) / rate).toFixed(2);
}

selectorBtn.addEventListener('change', async event => {
    let currencyID;
    const tDsWithSalary = document.querySelectorAll('td[data-salary]');
    const salaryArr = Array.from(tDsWithSalary);

    switch (selectorBtn.value) {
        case 'BYN':
            salaryArr.forEach(tD => tD.innerText = tD.dataset.originalValue);
            return;
        case 'USD':
            currencyID = 145;
            break;
        case 'EUR':
            currencyID = 292;
            break;
        default: break;
    }

    const res = await getData(currencyID);

    salaryArr.forEach(employee => employee.innerText = convertData(res, employee));
})

function deleteTableRow(buttonEl) {
    const tdEl = buttonEl.parentElement;
    const tRowEl = tdEl.parentElement;
    const tBodyEl = tRowEl.parentElement;

    tBodyEl.removeChild(tRowEl);
}