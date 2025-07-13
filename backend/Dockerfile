FROM openjdk:17-slim as build
WORKDIR /workspace/app

# Install Maven
RUN apt-get update && \
    apt-get install -y maven

# Copy pom.xml for dependency resolution
COPY pom.xml .

# Copy source code
COPY src src

# Build the application
RUN mvn package -DskipTests

# Extract the built JAR
RUN mkdir -p target/dependency && (cd target/dependency; jar -xf ../*.jar)

# Runtime stage
FROM openjdk:17-slim
VOLUME /tmp
ARG DEPENDENCY=/workspace/app/target/dependency

# Install Maven for development hot-reloading
RUN apt-get update && \
    apt-get install -y maven

# Set working directory
WORKDIR /workspace/app

# Copy the dependency application file structure
COPY --from=build ${DEPENDENCY}/BOOT-INF/lib /workspace/app/lib
COPY --from=build ${DEPENDENCY}/META-INF /workspace/app/META-INF
COPY --from=build ${DEPENDENCY}/BOOT-INF/classes /workspace/app/classes

# Copy the pom.xml for development
COPY pom.xml /workspace/app/

# Add development entry point script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose the application port
EXPOSE 8080

# Use the development entry point
CMD ["docker-entrypoint.sh"] 