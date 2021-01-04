package com.oracle.demo;

import io.helidon.webserver.Routing;
import io.helidon.webserver.ServerRequest;
import io.helidon.webserver.ServerResponse;
import io.helidon.webserver.Service;

import java.util.Date;
import java.util.logging.Logger;

public class SampleService implements Service {

    private static final Logger LOGGER = Logger.getLogger(SampleService.class.getName());

    @Override
    public void update(Routing.Rules rules) {
        rules
                .get("/header-query-logging/{+}", this::loggingRequestHeaderAndQueryParams)
                .get("/require-header", this::checkIncludedSpecificRequestHeader);
    }

    private void loggingRequestHeaderAndQueryParams(ServerRequest req, ServerResponse res) {
        var now = new Date();
        LOGGER.info(String.format("%s: Request Headers", now));
        req.headers().toMap().entrySet().forEach(entry -> {
            LOGGER.info(String.format("%s: %s", entry.getKey(), entry.getValue()));
        });
        LOGGER.info(String.format("%s: Request Params", now));
        req.queryParams().toMap().entrySet().forEach(entry -> {
            LOGGER.info(String.format("%s: %s", entry.getKey(), entry.getValue()));
        });
        req.path().segments().forEach(LOGGER::info);
        res.send(String.format("Hello %s!", req.path().segments().get(1)));
    }

    private void checkIncludedSpecificRequestHeader(ServerRequest req, ServerResponse res) {
        var now = new Date();
        if (!req.headers().toMap().containsKey("required-header")) {
            LOGGER.info(String.format("%s: Missing required-header in HTTP Request Headers.", now));
            res.send("Missing required-header in HTTP Request Headers.");
        }
        res.send("Include specific HTTP Request Header!");
    }
}
