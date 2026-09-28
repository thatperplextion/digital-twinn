# Dashboard API Dockerfile - Java 21
# Build from repo root

# Stage 1: Build
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /build

# Install Maven
RUN apk add --no-cache maven

# Copy all project files (entire monorepo)
COPY pom.xml ./
COPY twin-common ./twin-common
COPY twin-core ./twin-core
COPY twin-dashboard-api ./twin-dashboard-api
COPY twin-event-gateway ./twin-event-gateway
COPY twin-state-engine ./twin-state-engine
COPY twin-prediction-engine ./twin-prediction-engine
COPY twin-anomaly-engine ./twin-anomaly-engine
COPY twin-action-engine ./twin-action-engine

# Build the application with dependencies
RUN mvn clean package -pl twin-dashboard-api -am -DskipTests

# Stage 2: Run
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring

COPY --from=builder /build/twin-dashboard-api/target/*.jar app.jar

RUN chown spring:spring app.jar
USER spring:spring

ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC"
ENV PORT=8080

EXPOSE ${PORT}

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT} -jar app.jar"]
