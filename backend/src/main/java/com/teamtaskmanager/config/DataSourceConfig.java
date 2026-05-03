package com.teamtaskmanager.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Bean
    @Primary
    public DataSource dataSource() {
        String url = System.getenv("DATABASE_URL");
        String user = System.getenv("PGUSER");
        String password = System.getenv("PGPASSWORD");
        String host = System.getenv("PGHOST");
        String port = System.getenv("PGPORT");
        String dbName = System.getenv("PGDATABASE");

        String jdbcUrl;
        if (host != null && dbName != null) {
            jdbcUrl = "jdbc:postgresql://" + host + ":" + (port != null ? port : "5432") + "/" + dbName;
        } else if (url != null) {
            if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
                int schemeEnd = url.indexOf("://") + 3;
                jdbcUrl = "jdbc:postgresql://" + url.substring(schemeEnd);
            } else {
                jdbcUrl = url;
            }
        } else {
            throw new RuntimeException("No database connection info found in environment");
        }

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(jdbcUrl);
        if (user != null) config.setUsername(user);
        if (password != null) config.setPassword(password);
        config.setMaximumPoolSize(5);
        return new HikariDataSource(config);
    }
}
