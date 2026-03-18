# Multi-stage build for Spring Boot DDD microservice
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .
COPY common/pom.xml common/
COPY domain/pom.xml domain/
COPY infrastructure/pom.xml infrastructure/
COPY application/pom.xml application/
COPY interface/pom.xml interface/
COPY bootstrap/pom.xml bootstrap/
# Download dependencies first (layer cache)
RUN mvn dependency:go-offline -B 2>/dev/null || true
COPY . .
RUN mvn package -DskipTests -B

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/bootstrap/target/*.jar app.jar
EXPOSE 8080
ENV JAVA_OPTS="-Xms256m -Xmx512m"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
