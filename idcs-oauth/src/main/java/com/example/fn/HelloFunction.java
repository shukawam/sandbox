package com.example.fn;

import java.util.Map;

public class HelloFunction {

    private static final String TYPE = "TOKEN";

    public Result handleRequest(Input input) {
        var invalidResult = invalidResult();
        if (!checkInput(input)) {
            return invalidResult;
        }
        System.out.println("*** Token ***");
        System.out.println(input.getToken());
        return invalidResult;
    }

    private static boolean checkInput(Input input) {
        return input == null || "".equals(input.getType()) || !TYPE.equals(input.getType()) || input.getToken() == null || "".equals(input.getToken()) ? false : true;
    }

    private static Result validResult() {
        var validResult = new Result();
        validResult.setActive(true);
        validResult.setExpiresAt("2019-05-30T10:15:30+01:00");
        validResult.setPrincipal("https://example.com/users/jdoe");
        validResult.setScope(new String[]{"list:hello", "read:hello"});
        validResult.setClientId("host123");
        validResult.setContext(Map.of("email", "john.doe@example.com"));
        return validResult;
    }

    private static Result invalidResult() {
        var invalidResult = new Result();
        invalidResult.setActive(false);
        invalidResult.setExpiresAt("2019-05-30T10:15:30+01:00");
//        invalidResult.setContext(Map.of("email", "john.doe@example.com"));
        invalidResult.setWwwAuthenticate("Basic realm=\"example.com\"");
        return invalidResult;
    }
}