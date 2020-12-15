package com.example.fn;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;
import java.util.concurrent.CompletionException;

public class HelloFunction {

    // Oracle Functions Contexts
    private static final String ORDS_BASE_URL = "ords_base_url";
    private static final String CLIENT_ID = "client_id";
    private static final String CLIENT_SECRET = "client_secret";

    private final HttpClient httpClient = HttpClient.newHttpClient();

    public List<Item> handleRequest() {
        var ordsBaseUrl = System.getenv(ORDS_BASE_URL);
        var httpRequest = HttpRequest
                .newBuilder(URI.create(ordsBaseUrl + "/api/v1/items"))
                .header("Authorization", getAuthToken(ordsBaseUrl))
                .GET()
                .build();
        try {
            var httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            System.out.println(httpResponse.body());
            return new Gson().fromJson(httpResponse.body(), new TypeToken<OrdsResponse>(){}.getType());
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
            throw new RuntimeException();
        }
    }

    private String getAuthToken(String ordsBaseUrl) {
        String authToken = "";
        try {
            var clientId = System.getenv(CLIENT_ID);
            var clientSecret = System.getenv(CLIENT_SECRET);
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