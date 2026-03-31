FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

RUN apk add --no-cache \
    curl \
    netcat-openbsd \
    maven

COPY pom.xml .
COPY src ./src
COPY certs ./certs

RUN mvn clean package -DskipTests

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f -k https://localhost:5000/api/health || exit 1

CMD ["java", "-jar", "target/secure-webapp-backend-*.jar"]

