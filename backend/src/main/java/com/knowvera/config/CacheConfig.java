package com.knowvera.config;

import java.time.Duration;

import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.github.benmanes.caffeine.cache.Caffeine;

@Configuration
public class CacheConfig {

    public static final String BOOKS_BY_ID = "booksById";
    public static final String BOOKS_PAGE = "booksPage";
    public static final String BOOKS_SEARCH = "booksSearch";
    public static final String USERS_BY_ID = "usersById";
    public static final String USERS_PAGE = "usersPage";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(
                BOOKS_BY_ID, BOOKS_PAGE, BOOKS_SEARCH, USERS_BY_ID, USERS_PAGE);
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .maximumSize(2_000)
                .expireAfterWrite(Duration.ofMinutes(5)));
        return cacheManager;
    }
}

