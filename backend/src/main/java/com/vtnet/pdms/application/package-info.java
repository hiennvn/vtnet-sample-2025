/**
 * Application Layer - Contains the application services and use cases.
 * 
 * This package orchestrates the flow of data to and from the domain entities and directs
 * them to perform their operations. It includes:
 * 
 * - Application Services: Orchestrate domain objects to perform specific use cases
 * - DTOs (Data Transfer Objects): Objects used to transfer data between the application and interface layers
 * - Mappers: Convert between domain objects and DTOs
 * - Command/Query Handlers: Handle specific commands or queries from the interface layer
 * 
 * The application layer depends on the domain layer but has no dependencies on infrastructure
 * or interface layers. It coordinates the application activity without knowing the details
 * of UI, database, or external services.
 */
package com.vtnet.pdms.application; 