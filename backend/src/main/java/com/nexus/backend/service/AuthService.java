package com.nexus.backend.service;

import com.nexus.backend.dto.AuthResponse;
import com.nexus.backend.dto.LoginRequest;
import com.nexus.backend.dto.RegisterRequest;
import com.nexus.backend.model.Role;
import com.nexus.backend.model.User;
import com.nexus.backend.repository.RoleRepository;
import com.nexus.backend.repository.UserRepository;
import com.nexus.backend.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("El usuario ya existe");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        Role userRole = roleRepository.findByName(Role.RoleName.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        Set<Role> roles = new HashSet<>();
        roles.add(userRole);
        user.setRoles(roles);

        userRepository.save(user);

        String token = jwtUtils.generateToken(user.getUsername());
        return new AuthResponse(token, user.getUsername(), "ROLE_USER");
    }

    public AuthResponse login(LoginRequest request) {
    try {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );
        String username = authentication.getName();
        String role = authentication.getAuthorities().iterator().next().getAuthority();
        String token = jwtUtils.generateToken(username);
        return new AuthResponse(token, username, role);
    } catch (Exception e) {
        System.out.println("ERROR LOGIN: " + e.getMessage());
        throw e;
    }
}
}