package com.example.fn;

import java.util.Base64;
import java.util.Map;

public class HelloFunction {

    private static final String TOKEN_PREFIX = "Basic ";

    private static final String USER = "sample";

    private static final String PASSWORD = "password";

    public static class Input {
        public String type;
        public String token;
    }

    public static class Result {
        // required
        public boolean active = false;
        public String principal;
        public String[] scope;
        public String expiresAt;
        // optional
        public String wwwAuthenticate;
        // optional
        public String clientId;
        // optional context
        public Map<String, Object> context;
    }

    public Result handleRequest(Input input) {
        var result = new Result();
        if (input.token == null || !input.token.startsWith(TOKEN_PREFIX)) {
            result.active = false;
            result.expiresAt = "2021-01-10T10:15:30+01:00";
            result.wwwAuthenticate = "Basic error=\"missing_token\"";
            return result;
        }
        var correctToken = Base64.getEncoder().encode(String.format("%s:%s", USER, PASSWORD).getBytes());
        if (!correctToken.equals(input.token.substring(TOKEN_PREFIX.length()))) {
            result.active = false;
            result.expiresAt = "2021-01-10T10:15:30+01:00";
            result.wwwAuthenticate = "Basic error=\"invalid_token\"";
            return result;
        }
        result.active = true;
        result.expiresAt = "2021-01-10T10:15:30+01:00\"";
        result.principal = USER;
        result.scope = new String[]{"list:hello", "create:hello"};
        return result;
    }


}