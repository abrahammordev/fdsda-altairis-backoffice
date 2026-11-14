# --- Build ---
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Dependencias primero para aprovechar la caché de capas
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw && ./mvnw -q -B dependency:go-offline

COPY src/ src/
RUN ./mvnw -q -B package -DskipTests

# --- Runtime ---
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd --system --uid 1001 spring
COPY --from=build /app/target/*.jar app.jar
USER spring
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
