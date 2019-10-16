package com.vscode4teaching.vscode4teachingserver.controllers;

import javax.validation.Valid;

import com.fasterxml.jackson.annotation.JsonView;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.JWTRequest;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.JWTResponse;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.UserDTO;
import com.vscode4teaching.vscode4teachingserver.model.User;
import com.vscode4teaching.vscode4teachingserver.model.views.UserViews;
import com.vscode4teaching.vscode4teachingserver.security.jwt.JWTTokenUtil;
import com.vscode4teaching.vscode4teachingserver.servicesimpl.JWTUserDetailsService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin
@Validated
public class JWTLoginController {

    private final AuthenticationManager authenticationManager;
    private final JWTTokenUtil jwtTokenUtil;
    private final JWTUserDetailsService userDetailsService;
    private final PasswordEncoder bCryptPasswordEncoder;

    public JWTLoginController(AuthenticationManager authenticationManager, JWTTokenUtil jwtTokenUtil,
            JWTUserDetailsService userDetailsService, BCryptPasswordEncoder bCryptPasswordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenUtil = jwtTokenUtil;
        this.userDetailsService = userDetailsService;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<JWTResponse> generateLoginToken(@Valid @RequestBody JWTRequest loginRequest) {
        String username = loginRequest.getUsername();
        login(username, loginRequest.getPassword());
        final UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        final String token = jwtTokenUtil.generateToken(userDetails);
        return ResponseEntity.ok(new JWTResponse(token));
    }

    private void login(String username, String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
    }

    @PostMapping("/register")
    @JsonView(UserViews.GeneralView.class)
    public ResponseEntity<User> saveUser(@Valid @RequestBody UserDTO userDto) {
        String encodedPassword = bCryptPasswordEncoder.encode(userDto.getPassword());
        User user = new User(userDto.getEmail(), userDto.getUsername(), encodedPassword, userDto.getName(),
                userDto.getLastName());
        return new ResponseEntity<>(userDetailsService.save(user, false), HttpStatus.CREATED);
    }

    @PostMapping("/teacher/register")
    @JsonView(UserViews.GeneralView.class)
    public ResponseEntity<User> saveTeacher(@Valid @RequestBody UserDTO userDto) {
        String encodedPassword = bCryptPasswordEncoder.encode(userDto.getPassword());
        User user = new User(userDto.getEmail(), userDto.getUsername(), encodedPassword, userDto.getName(),
                userDto.getLastName());
        return new ResponseEntity<>(userDetailsService.save(user, true), HttpStatus.CREATED);
    }
}