package edu.eci.tdse.securewebapp.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        if (loginRequest.username() == null || loginRequest.username().isBlank()
                || loginRequest.password() == null || loginRequest.password().isBlank()) {
            return ResponseEntity.badRequest().body(new LoginResponse(false, "Username and password are required."));
        }

        boolean authenticated = authService.validateCredentials(loginRequest.username(), loginRequest.password());
        if (!authenticated) {
            return ResponseEntity.status(401).body(new LoginResponse(false, "Invalid credentials."));
        }

        return ResponseEntity.ok(new LoginResponse(true, "Login successful."));
    }
}

