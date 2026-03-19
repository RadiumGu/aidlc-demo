# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .
COPY points-service-api/pom.xml points-service-api/
COPY points-service-app/pom.xml points-service-app/
RUN mvn dependency:go-offline -B 2>/dev/null || true
COPY . .
RUN mvn clean package -DskipTests -B

# Stage 2: Run
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/points-service-app/target/points-service-app-*.jar app.jar
EXPOSE 8003
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=docker"]
