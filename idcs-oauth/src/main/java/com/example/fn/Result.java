package com.example.fn;

import java.util.Map;

/**
 * API Gatewayに返却するデータ
 */
public class Result {

    // Common
    /**
     * アクセス・トークンの検証結果
     */
    private boolean active;

    /**
     * アクセス・トークンの有効期限(ISO-8601 Format)
     */
    private String expiresAt;

    /**
     * (Optional)API Gatewayに返却する任意のKey-Value形式のデータ
     */
    private Map<String, Object> context;

    // HTTP 2xx
    /**
     * IdPから取得したユーザ／アプリケーション
     */
    private String principal;

    /**
     * アクセス・スコープ
     */
    private String[] scope;


    /**
     * (Optional)リクエスト元のホスト／クライアントIP
     */
    private String clientId;

    // HTTP 5xx
    /**
     * API Gatewayに返却されるWWW-Authenticateヘッダの値
     */
    private String wwwAuthenticate;

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(String expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Map<String, Object> getContext() {
        return context;
    }

    public void setContext(Map<String, Object> context) {
        this.context = context;
    }

    public String getPrincipal() {
        return principal;
    }

    public void setPrincipal(String principal) {
        this.principal = principal;
    }

    public String[] getScope() {
        return scope;
    }

    public void setScope(String[] scope) {
        this.scope = scope;
    }

    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public String getWwwAuthenticate() {
        return wwwAuthenticate;
    }

    public void setWwwAuthenticate(String wwwAuthenticate) {
        this.wwwAuthenticate = wwwAuthenticate;
    }
}
