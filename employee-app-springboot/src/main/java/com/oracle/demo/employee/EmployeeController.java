package com.oracle.demo.employee;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class EmployeeController {

    private final EmployeeService employeeService;

    private static final String BASE_URL = "/api/v1/employee";

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping(path = BASE_URL + "/{id}")
    public Employees selectEmployee(@PathVariable("id") Integer id) {
        return employeeService.selectEmployee(id);
    }

    @GetMapping(path = BASE_URL)
    public List<Employees> selectAllEmployees() {
        return employeeService.selectAllEmployees();
    }

    @PostMapping(path = BASE_URL)
    public Employees createEmployee(@RequestBody Employees employees) {
        return employeeService.createEmployee(employees);
    }

    @PutMapping(path = BASE_URL + "/{id}")
    public Employees updateEmployee(@PathVariable("id") Integer id, @RequestBody Employees employees) {
        return employeeService.updateEmployee(id, employees);
    }

    @DeleteMapping(path = BASE_URL + "/{id}")
    public void deleteEmployee(@PathVariable("id") Integer id) {
        employeeService.deleteEmployee(id);
    }

}
