package com.teamtaskmanager.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Bean
    @Primary
    public DataSource dataSource() {
        String url = System.getenv("DATABASE_PUBLIC_URL");
        if (url == null) url = System.getenv("DATABASE_URL");
        
        if (url == null) {
            throw new RuntimeException("No DATABASE_PUBLIC_URL or DATABASE_URL found");
        }

        if (url.startsWith("postgres://")) {
            url = "jdbc:postgresql://" + url.substring("postgres://".length());
        } else if (url.startsWith("postgresql://")) {
            url = "jdbc:postgresql://" + url.substring("postgresql://".length());
        }

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(url);
        config.setMaximumPoolSize(5);
        return new HikariDataSource(config);
    }
}
