package com.petwellness.config;

import java.sql.Connection;

import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class DatabaseHealthCheck implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseHealthCheck.class);
    private final DataSource dataSource;

    public DatabaseHealthCheck(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        try (Connection conn = dataSource.getConnection()) {
            String url = conn.getMetaData().getURL();
            String user = conn.getMetaData().getUserName();
            log.info("Database connectivity check passed. URL: {} , User: {}", url, user);
        } catch (Exception ex) {
            log.error("Database connectivity check failed. Please ensure XAMPP MySQL is running, port/credentials are correct, and DB exists. Error: {}", ex.getMessage());
            throw ex; // Fail fast so the error is visible on startup
        }
    }
}
