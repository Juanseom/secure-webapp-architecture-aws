package edu.eci.tdse.securewebapp.auth;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final PasswordEncoder passwordEncoder;
    private final Map<String, String> usersByUsername = new ConcurrentHashMap<>();

    public AuthService(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
        usersByUsername.put("student", passwordEncoder.encode("student123"));
    }

    public boolean validateCredentials(String username, String password) {
        String storedHash = usersByUsername.get(username);
        if (storedHash == null) {
            return false;
        }
        return passwordEncoder.matches(password, storedHash);
    }
}

