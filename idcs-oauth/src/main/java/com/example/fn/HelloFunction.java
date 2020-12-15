package com.example.fn;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

public class HelloFunction {

    private static final String TYPE = "TOKEN";

    private static HttpClient httpClient = HttpClient.newHttpClient();

    public Result handleRequest(Input input) throws IOException, InterruptedException {
        System.out.println("Entering the Authorizer Functions!");
        var invalidResult = invalidResult();
        if (!checkInput(input)) {
            return invalidResult;
        }
        System.out.println("Access Token: ");
        System.out.println(input.getToken());
        if (!introspectAccessToken(input.getToken())) {
            return invalidResult;
        }
        return validResult();
    }

    private static boolean checkInput(Input input) {
        return input == null || "".equals(input.getType()) || !TYPE.equals(input.getType()) || input.getToken() == null || "".equals(input.getToken()) ? false : true;
    }

    private static boolean introspectAccessToken(String accessToken) throws IOException, InterruptedException {
        System.out.println("Entering the HelloFunction#introspectAccessToken");
        var credential = System.getenv("client_id") + ":" + System.getenv("client_secret");
        System.out.println("Show the base64 encoded client credential.");
        System.out.println(credential);
        var httpRequest = HttpRequest
                .newBuilder(URI.create(System.getenv("idcs_base_url") + "/oauth2/v1/introspect"))
                .headers(
                        "Content-Type", "application/x-www-form-urlencoded",
                        "Authorization", "Basic " + Base64.getEncoder().encodeToString(credential.getBytes())
                )
                .POST(HttpRequest.BodyPublishers.ofString("token=" + accessToken))
                .build();
        var httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
        ObjectMapper mapper = new ObjectMapper();
        TypeReference<HashMap<String, Object>> typeRef = new TypeReference<HashMap<String, Object>>() {
        };
        HashMap<String, Object> validateResult = mapper.readValue(httpResponse.body(), typeRef);
        return (boolean) validateResult.get("active");
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