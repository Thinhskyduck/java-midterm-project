package com.example.springcommerce;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class SpringcommerceApplication {

	public static void main(String[] args) {
		SpringApplication.run(SpringcommerceApplication.class, args);
	}

}
