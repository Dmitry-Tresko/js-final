function getEmployees(receivedID) {
    const data = localStorage.getItem('employees');

    const employees = JSON.parse(data);

    if (receivedID !== undefined) {
        const foundedEmployee = employees.find(employee => employee.id == receivedID);
        return foundedEmployee;
    }

    return employees;
}

function updateEmployee(employeeID, receivedEmployee) {
    try {
        const employees = getEmployees();
        const selectedEmployeeIdx = employees.findIndex(employee => employee.id == employeeID);

        if (selectedEmployeeIdx === -1) {
            alert('Employee does not exist');
            return;
        }

        employees[selectedEmployeeIdx] = receivedEmployee;

        localStorage.setItem('employees', JSON.stringify(employees));

        alert('Employee was updated');
    } catch (error) {
        alert('Error while setting data into localStorage');
    }
}

function deleteEmployee(employeeID) {
    try {
        const receivedEmployees = getEmployees();

        const employeesToSave = receivedEmployees.filter(employee => employee.id !== employeeID)

        localStorage.setItem('employees', JSON.stringify(employeesToSave));

        alert('Employee was deleted');
    } catch (error) {
        alert('Error while deleting data from localStorage');
    }
}

export default {
    getEmployees,
    updateEmployee,
    deleteEmployee,
}