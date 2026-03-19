# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .
COPY order-service-api/pom.xml order-service-api/
COPY order-service-app/pom.xml order-service-app/
RUN mvn dependency:go-offline -B 2>/dev/null || true
COPY . .
RUN mvn clean package -DskipTests -B

# Stage 2: Run
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/order-service-app/target/order-service-app-*.jar app.jar
EXPOSE 8004
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=docker"]
