package com.example.fn;

/**
 * API Gatewayから取得するデータ
 */
public class Input {

    private String type;

    private String token;

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
