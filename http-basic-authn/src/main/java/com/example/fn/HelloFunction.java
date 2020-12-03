package com.example.fn;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

public class HelloFunction {

    private static final String SAMPLE_USER = "test001@example.com:password123";

    private static final String TYPE = "TOKEN";

    public Result handleRequest(Input input) {
        final var invalidResult = invalidResult();
        if (!checkInput(input)) {
            return invalidResult;
        }
        final var expectedToken = Base64.getEncoder().encodeToString(SAMPLE_USER.getBytes(StandardCharsets.UTF_8));
        if (!expectedToken.equals(input.getToken().replaceAll("Basic\\s", ""))) {
            System.out.println("Basic Authentication is failed!");
            return invalidResult;
        }
        System.out.println("Basic Authentication is success!");
        return validResult();
    }

    private static boolean checkInput(Input input) {
        return  input == null || "".equals(input.getType()) || !TYPE.equals(input.getType()) || input.getToken() == null || "".equals(input.getToken()) ? false : true;
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