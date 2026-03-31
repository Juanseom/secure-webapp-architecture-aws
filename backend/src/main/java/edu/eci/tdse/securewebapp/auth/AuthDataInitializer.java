package edu.eci.tdse.securewebapp.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AuthDataInitializer {

    @Bean
    public ApplicationRunner authInitializer(
            UserAccountRepository userAccountRepository,
            PasswordEncoder passwordEncoder,
            @Value("${APP_SEED_ENABLED:false}") boolean seedEnabled,
            @Value("${APP_SEED_USERNAME:}") String seedUsername,
            @Value("${APP_SEED_PASSWORD:}") String seedPassword) {
        return args -> {
            if (!seedEnabled) {
                return;
            }
            if (seedUsername == null || seedUsername.isBlank() || seedPassword == null || seedPassword.isBlank()) {
                throw new IllegalStateException("APP_SEED_USERNAME and APP_SEED_PASSWORD are required when APP_SEED_ENABLED=true");
            }
            if (userAccountRepository.findByUsername(seedUsername).isEmpty()) {
                userAccountRepository.save(new UserAccount(seedUsername, passwordEncoder.encode(seedPassword)));
            }
        };
    }
}

