# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY api-gateway-api/pom.xml api-gateway-api/
COPY api-gateway-app/pom.xml api-gateway-app/
RUN mvn dependency:go-offline -B
COPY api-gateway-api/src api-gateway-api/src
COPY api-gateway-app/src api-gateway-app/src
RUN mvn clean package -DskipTests -B

# Stage 2: Run
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/api-gateway-app/target/*.jar app.jar
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=docker
ENTRYPOINT ["java", "-jar", "app.jar"]
