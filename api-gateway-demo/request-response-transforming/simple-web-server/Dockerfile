# 1st stage: build the application
FROM maven:3.6-jdk-11 as build

WORKDIR /helidon

ADD pom.xml .
ADD src src
RUN mvn package

RUN echo "build stage done!"

# 2nd stage: build the runtime stage
FROM openjdk:11-jre-slim
WORKDIR /helidon

# copy the binary from build stage
COPY --from=build /helidon/target/simple-web-server.jar ./
COPY --from=build /helidon/target/libs ./libs

CMD ["java", "-jar", "simple-web-server.jar"]

EXPOSE 8080