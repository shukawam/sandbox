package com.example.fn;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

public class HelloFunction {

    private static final String OK_USER = "test001@example.com:password123";

    private static final String TYPE = "TOKEN";

    public Result handleRequest(Input input) {
        final var invalidResult = invalidatedResult();
        if ("".equals(input.getType()) || !TYPE.equals(input.getType())) {
            return invalidResult;
        }
        if (input.getToken() == null || "".equals(input.getToken())) {
            return invalidResult;
        }
        var expectedToken = Base64.getEncoder().encodeToString(OK_USER.getBytes(StandardCharsets.UTF_8));
        if (!expectedToken.equals(input.getToken())) {
            System.out.println("Basic Authentication is failed!");
            return invalidResult;
        }
        return validatedResult();
    }

    private static Result validatedResult() {
        var validatedResult = new Result();
        validatedResult.setActive(true);
        validatedResult.setExpiresAt("2019-05-30T10:15:30+01:00");
        validatedResult.setPrincipal("https://example.com/users/jdoe");
        validatedResult.setScope(new String[]{"list:hello", "read:hello", "create:hello", "update:hello", "delete:hello", "someScope"});
        validatedResult.setClientId("host123");
        validatedResult.setContext(Map.of("email", "john.doe@example.com"));
        return validatedResult;
    }

    private static Result invalidatedResult() {
        var invalidatedResult = new Result();
        invalidatedResult.setActive(false);
        invalidatedResult.setExpiresAt("2019-05-30T10:15:30+01:00");
//        invalidatedResult.setContext(Map.of("email", "john.doe@example.com"));
        invalidatedResult.setWwwAuthenticate("Basic realm=\"example.com\"");
        return invalidatedResult;
    }

}