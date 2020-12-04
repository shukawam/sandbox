package com.oracle.demo.employee;

import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.List;

@Service
@Transactional
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public Employees selectEmployee(Integer id) {
        var employee = employeeRepository.findById(id);
        if (employee.isEmpty()) {
            throw new RuntimeException(String.format("ID: %s の従業員は存在しません。", id));
        }
        return employee.get();
    }

    public List<Employees> selectAllEmployees() {
        return employeeRepository.findAll();
    }

    public Employees createEmployee(Employees employees) {
        return employeeRepository.save(employees);
    }

    public Employees updateEmployee(Integer id, Employees employees) {
        var oldEmployee = employeeRepository.findById(id);
        if (oldEmployee.isEmpty()) {
            throw new RuntimeException(String.format("ID: %s の従業員は存在しません。", id));
        }
        BeanUtils.copyProperties(employees, oldEmployee.get());
        return employeeRepository.save(oldEmployee.get());
    }

    public boolean deleteEmployee(Integer id) {
        var employee = employeeRepository.findById(id);
        if (employee.isEmpty()) {
            throw new RuntimeException(String.format("ID: %s の従業員は存在しません。", id));
        }
        employeeRepository.delete(employee.get());
        return true;
    }
}
