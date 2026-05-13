package org.example.sellsight.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cm = new CaffeineCacheManager();
        // Single product lookups — high hit rate, safe for 10 min
        cm.registerCustomCache("products",
                Caffeine.newBuilder().maximumSize(5000).expireAfterWrite(10, TimeUnit.MINUTES).build());
        // First-page listing cursor — shorter TTL so new products appear quickly
        cm.registerCustomCache("product-listings",
                Caffeine.newBuilder().maximumSize(200).expireAfterWrite(3, TimeUnit.MINUTES).build());
        // Filtered/sorted listing pages — was missing, causing uncached scans on every request
        cm.registerCustomCache("product-filter-listings",
                Caffeine.newBuilder().maximumSize(1000).expireAfterWrite(2, TimeUnit.MINUTES).build());
        // Admin analytics summary — expensive aggregates, short TTL keeps the page responsive
        cm.registerCustomCache("analytics-summary",
                Caffeine.newBuilder().maximumSize(100).expireAfterWrite(30, TimeUnit.SECONDS).build());
        // Consumer recommendations — short TTL so new events appear in recommendations quickly
        cm.registerCustomCache("consumer-recommendations",
                Caffeine.newBuilder().maximumSize(100).expireAfterWrite(30, TimeUnit.SECONDS).build());
        cm.registerCustomCache("seller-analytics",
                Caffeine.newBuilder().maximumSize(500).expireAfterWrite(30, TimeUnit.SECONDS).build());
        return cm;
    }
}
