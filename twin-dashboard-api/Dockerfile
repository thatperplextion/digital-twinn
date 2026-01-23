# Simple Dockerfile using pre-built JAR
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring
COPY target/*.jar app.jar
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC"
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
