package org.example.sellsight;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class SellsightApplication {

	public static void main(String[] args) {
		SpringApplication.run(SellsightApplication.class, args);
	}

}
