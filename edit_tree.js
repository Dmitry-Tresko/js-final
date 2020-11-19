import companyArr from './company.json';
import employeesArr from './employees.json';

if (!localStorage.getItem('company')) {
    localStorage.setItem('company', JSON.stringify(companyArr));
}

if (!localStorage.getItem('employees')) {
    localStorage.setItem('employees', JSON.stringify(employeesArr));
}

let company = JSON.parse(localStorage.getItem('company'));
let employees = JSON.parse(localStorage.getItem('employees'));

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

        const editButtonEl = document.createElement('button');
        editButtonEl.innerText = 'edit';
        editButtonEl.classList.add('edit-tree-btn');

        const addButtonEl = document.createElement('button');
        addButtonEl.innerText = 'add';
        addButtonEl.classList.add('add-tree-btn');

        const delButtonEl = document.createElement('button');

        if (branchEl.children) {
            liEl.appendChild(makePreposotion());
        }

        spanEl.innerText = branchEl.name;
        spanEl.dataset.deptId = branchEl.id;

        if (!deptIds.includes(branchEl.id)) {
            spanEl.classList.add('disabled-tree-item');
        }

        liEl.appendChild(spanEl);
        liEl.appendChild(editButtonEl);
        liEl.appendChild(addButtonEl);

        if (!branchEl.children) {
            delButtonEl.classList.add('delete-tree-btn');
            liEl.appendChild(delButtonEl);
        }

        rootEl.appendChild(liEl);

        if (branchEl.children) {
            const ulEl = document.createElement('ul');
            liEl.appendChild(ulEl);
            buildTree(branchEl.children, ulEl);
        }
    }
}

const jsTree = makeTree(company);
const containerEl = document.getElementById('container-tree');
createDOMTree(jsTree, containerEl);

containerEl.addEventListener('click', event => {
    if (event.target.tagName === "I") {
        const elToHide = event.target.parentElement.getElementsByTagName('ul')[0];
        elToHide.classList.toggle('hidden');
    }

    if (event.target.classList.contains('edit-tree-btn')) {
        const liEl = event.target.parentElement;
        const spanEl = liEl.getElementsByTagName('SPAN')[0];

        const oldDeptName = spanEl.innerText;
        const newDeptName = prompt('Enter new name of selected department: ', oldDeptName);

        if (newDeptName) {
            const isConfirmed = confirm(`Are you sure that you want to change the name of "${oldDeptName}" department?`);
            if (isConfirmed) {
                updateCompanyName(oldDeptName, newDeptName);
                spanEl.innerText = newDeptName;
            }
        }
    }

    if (event.target.classList.contains('add-tree-btn')) {
        const receivedCompany = JSON.parse(localStorage.getItem('company'));
        const nameOfNewDept = prompt('Please, enter the name of new department');
        if (nameOfNewDept) {
            const deptIds = receivedCompany.map(company => company.id);
            const idxOfNewDept = Math.max(...deptIds) + 1;

            const liEl = event.target.parentElement;
            const parentSpanEl = liEl.getElementsByTagName('SPAN')[0];

            let newDept = {
                id: idxOfNewDept,
                parent_id: parentSpanEl.dataset.deptId,
                name: nameOfNewDept
            };

            receivedCompany[idxOfNewDept] = newDept;

            const newLiEl = document.createElement('li');
            liEl.appendChild(newLiEl);

            const spanEl = document.createElement('span');
            spanEl.dataset.deptId = newDept.id;

            const editButtonEl = document.createElement('button');
            editButtonEl.innerText = 'edit';
            editButtonEl.classList.add('edit-tree-btn');

            const addButtonEl = document.createElement('button');
            addButtonEl.innerText = 'add';
            addButtonEl.classList.add('add-tree-btn');

            const delButtonEl = document.createElement('button');
            delButtonEl.classList.add('delete-tree-btn');

            spanEl.innerText = nameOfNewDept;
            newLiEl.appendChild(spanEl);
            newLiEl.appendChild(editButtonEl);
            newLiEl.appendChild(addButtonEl);
            newLiEl.appendChild(delButtonEl);

            localStorage.setItem('company', JSON.stringify(receivedCompany));

            alert(`A "${nameOfNewDept}" department was added`);
        }
    }

    if (event.target.classList.contains('delete-tree-btn')) {
        const isConfirmed = confirm('Are you sure that you want to delete this department and its components?');
        if (isConfirmed) {
            const liEl = event.target.parentElement;
            const spanEl = liEl.getElementsByTagName('SPAN')[0];
            const ulEl = liEl.parentElement;

            ulEl.removeChild(liEl);

            const deletedDeptId = spanEl.dataset.deptId;
            deleteDepartment(deletedDeptId);
        }
    }
})

function stringClone(collection) {
    return JSON.parse(JSON.stringify(collection));
}

function updateCompanyName(oldName, newName) {
    try {
        const selectedCompany = company.find(dept => dept.name == oldName);
        const selectedCompanyIdx = company.findIndex(dept => dept.name == oldName);

        selectedCompany.name = newName;
        company[selectedCompanyIdx] = selectedCompany;

        localStorage.setItem('company', JSON.stringify(company));

        alert('Department was updated');
    } catch (error) {
        alert('Error while setting data into localStorage');
    }
}

function deleteDepartment(deletedDeptId) {
    try {
        const receivedCompany = JSON.parse(localStorage.getItem('company'));

        const deptsToSave = receivedCompany.filter(dept => dept.id != deletedDeptId);

        localStorage.setItem('company', JSON.stringify(deptsToSave));

        alert('Department was deleted');
    } catch (error) {
        alert('Error while deleting data from localStorage');
    }
}