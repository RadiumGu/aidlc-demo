# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .
COPY product-service-api/pom.xml product-service-api/
COPY product-service-app/pom.xml product-service-app/
RUN mvn dependency:go-offline -B 2>/dev/null || true
COPY . .
RUN mvn clean package -DskipTests -B

# Stage 2: Run
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
RUN mkdir -p /app/uploads
COPY --from=builder /app/product-service-app/target/product-service-app-*.jar app.jar
EXPOSE 8002
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=docker"]
