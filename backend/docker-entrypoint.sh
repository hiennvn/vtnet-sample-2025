#!/bin/bash
set -e

# Check if we're in development mode
if [ "$SPRING_PROFILES_ACTIVE" = "dev" ]; then
  echo "Starting in development mode with hot reloading..."
  # Use Maven to run the application with spring-boot:run for hot reloading
  cd /workspace/app
  exec mvn spring-boot:run
else
  echo "Starting in production mode..."
  # Use the pre-built application
  cd /workspace/app
  exec java -cp classes:lib/* com.vtnet.pdms.PdmsApplication
fi 