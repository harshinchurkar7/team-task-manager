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
        String url = System.getenv("DATABASE_URL");
        if (url != null && url.startsWith("postgresql://")) {
            url = "jdbc:postgresql://" + url.substring("postgresql://".length());
        } else if (url != null && url.startsWith("postgres://")) {
            url = "jdbc:postgresql://" + url.substring("postgres://".length());
        }
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(url);
        config.setUsername(System.getenv("PGUSER"));
        config.setPassword(System.getenv("PGPASSWORD"));
        return new HikariDataSource(config);
    }
}
