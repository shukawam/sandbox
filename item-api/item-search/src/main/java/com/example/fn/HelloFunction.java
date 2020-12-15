package com.example.fn;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;

public class HelloFunction {

    private static final String ORDS_BASE_URL = "ords_base_url";

    private final HttpClient httpClient = HttpClient.newHttpClient();

    public List<Item> handleRequest() {
        final var ordsBaseUrl = System.getenv(ORDS_BASE_URL);
        var httpRequest = HttpRequest.newBuilder(URI.create(ordsBaseUrl + "/api/v1/items"))
                .header("Authorization", getAuthToken())
                .GET()
                .build();
        UncheckedObjectMapper objectMapper = new UncheckedObjectMapper();
        try {
            var httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            return new Gson().fromJson(httpResponse.body(), new TypeToken<List<Item>>(){}.getType());
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
            throw new RuntimeException();
        }
    }

    private String getAuthToken() {
        String authToken = "";
        try {
            var ordsBaseUrl = System.getenv("ords_base_url");
            var clientId = System.getenv("client_id");
            var clientSecret = System.getenv("client_secret");
            System.out.println("ordsBaseUrl:" + ordsBaseUrl);
            System.out.println("clientId:" + clientId);
            System.out.println("clientSecret:" + clientSecret);

            var authString = clientId + ":" + clientSecret;
            var authEncoded = "Basic " + Base64.getEncoder().encodeToString(authString.getBytes());
            System.out.println("oauth url:" + ordsBaseUrl + "/oauth/token");
            var request = HttpRequest.newBuilder(URI.create(ordsBaseUrl + "/oauth/token"))
                    .header("Authorization", authEncoded)
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString("grant_type=client_credentials"))
                    .build();
            var response = this.httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            System.out.println("response:" + response);
            String responseBody = response.body();
            ObjectMapper mapper = new ObjectMapper();
            TypeReference<HashMap<String, String>> typeRef = new TypeReference<HashMap<String, String>>() {
            };
            HashMap<String, String> result = mapper.readValue(responseBody, typeRef);
            authToken = result.get("access_token");
            System.out.println("authToken:" + authToken);
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
        return authToken;
    }

}

class UncheckedObjectMapper extends com.fasterxml.jackson.databind.ObjectMapper {
    /**
     * Parses the given JSON string into a Map.
     */
    Map<String, String> readValue(String content) {
        try {
            return this.readValue(content, new TypeReference<>() {
            });
        } catch (IOException ioe) {
            throw new CompletionException(ioe);
        }
    }
}