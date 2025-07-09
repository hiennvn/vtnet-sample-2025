package com.vtnet.pdms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Main application class for the Project Document Management System.
 */
@SpringBootApplication
@EnableJpaAuditing
public class PdmsApplication {

    public static void main(String[] args) {
        SpringApplication.run(PdmsApplication.class, args);
    }
} 