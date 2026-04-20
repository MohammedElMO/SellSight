package org.example.sellsight.shared.events.infrastructure;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicsConfig {

    @Bean
    NewTopic userEventsTopic(@Value("${app.kafka.topics.user-events:user-events}") String name) {
        return TopicBuilder.name(name).partitions(3).replicas(1).build();
    }
}
