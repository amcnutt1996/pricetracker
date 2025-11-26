# Multi-stage build for Java Spring Boot application
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Install Python and pip
RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Create python directory and install dependencies
RUN mkdir -p /app/python
COPY python/requirements.txt /app/python/
RUN pip3 install --break-system-packages --no-cache-dir -r /app/python/requirements.txt

COPY python/scraper.py /app/python/scraper.py
RUN chmod +x /app/python/scraper.py

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]