# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .
COPY common/pom.xml common/
COPY domain/pom.xml domain/
COPY domain/domain-model/pom.xml domain/domain-model/
COPY domain/domain-api/pom.xml domain/domain-api/
COPY domain/domain-impl/pom.xml domain/domain-impl/
COPY domain/repository-api/pom.xml domain/repository-api/
COPY domain/cache-api/pom.xml domain/cache-api/
COPY domain/mq-api/pom.xml domain/mq-api/
COPY domain/security-api/pom.xml domain/security-api/
COPY application/pom.xml application/
COPY application/application-api/pom.xml application/application-api/
COPY application/application-impl/pom.xml application/application-impl/
COPY interface/pom.xml interface/
COPY interface/interface-http/pom.xml interface/interface-http/
COPY interface/interface-consumer/pom.xml interface/interface-consumer/
COPY infrastructure/pom.xml infrastructure/
COPY infrastructure/repository/pom.xml infrastructure/repository/
COPY infrastructure/repository/mysql-impl/pom.xml infrastructure/repository/mysql-impl/
COPY infrastructure/cache/pom.xml infrastructure/cache/
COPY infrastructure/cache/redis-impl/pom.xml infrastructure/cache/redis-impl/
COPY infrastructure/mq/pom.xml infrastructure/mq/
COPY infrastructure/mq/sqs-impl/pom.xml infrastructure/mq/sqs-impl/
COPY infrastructure/security/pom.xml infrastructure/security/
COPY infrastructure/security/jwt-impl/pom.xml infrastructure/security/jwt-impl/
COPY bootstrap/pom.xml bootstrap/
# Download dependencies
RUN mvn dependency:go-offline -B 2>/dev/null || true
# Copy source and build
COPY . .
RUN mvn clean package -DskipTests -B

# Stage 2: Run
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/bootstrap/target/awsome-shop-auth-service-*.jar app.jar
EXPOSE 8001
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=docker"]
