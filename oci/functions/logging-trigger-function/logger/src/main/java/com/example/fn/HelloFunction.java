package com.example.fn;

public class HelloFunction {

    public String handleRequest(String input) {
        String name = (input == null || input.isEmpty()) ? "world"  : input;

        System.out.println("Logging Test"); 
        return "Hello, " + name + "!";
    }

}