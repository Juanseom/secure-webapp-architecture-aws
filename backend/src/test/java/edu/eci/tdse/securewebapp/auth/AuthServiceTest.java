package edu.eci.tdse.securewebapp.auth;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserAccountRepository userAccountRepository;

    private PasswordEncoder passwordEncoder;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        authService = new AuthService(userAccountRepository, passwordEncoder);
    }

    @Test
    void shouldReturnFalseWhenUserDoesNotExist() {
        when(userAccountRepository.findByUsername("student")).thenReturn(Optional.empty());

        boolean result = authService.validateCredentials("student", "student123");

        assertFalse(result);
    }

    @Test
    void shouldReturnFalseWhenPasswordIsInvalid() {
        String hash = passwordEncoder.encode("student123");
        when(userAccountRepository.findByUsername("student")).thenReturn(Optional.of(new UserAccount("student", hash)));

        boolean result = authService.validateCredentials("student", "wrong");

        assertFalse(result);
    }

    @Test
    void shouldReturnTrueWhenCredentialsAreValid() {
        String hash = passwordEncoder.encode("student123");
        when(userAccountRepository.findByUsername("student")).thenReturn(Optional.of(new UserAccount("student", hash)));

        boolean result = authService.validateCredentials("student", "student123");

        assertTrue(result);
    }
}

