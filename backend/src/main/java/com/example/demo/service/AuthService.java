package com.example.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.entity.AppUser;
import com.example.demo.entity.Member;
import com.example.demo.entity.UserRole;
import com.example.demo.exception.DuplicateResourceException;
import com.example.demo.exception.InvalidCredentialsException;
import com.example.demo.repository.AppUserRepository;
import com.example.demo.repository.MemberRepository;

@Service
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final MemberRepository memberRepository;

    public AuthService(AppUserRepository appUserRepository, MemberRepository memberRepository) {
        this.appUserRepository = appUserRepository;
        this.memberRepository = memberRepository;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (appUserRepository.existsByEmailIgnoreCase(request.getEmail())
                || memberRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new DuplicateResourceException("Account already exists with email " + request.getEmail());
        }

        if (request.getRole() == UserRole.LIBRARIAN && appUserRepository.existsByRole(UserRole.LIBRARIAN)) {
            throw new DuplicateResourceException("Only one librarian account is allowed");
        }

        Member member = null;
        if (request.getRole() == UserRole.MEMBER) {
            member = memberRepository.save(new Member(request.getName(), request.getEmail()));
        }

        AppUser user = new AppUser(
                request.getName(),
                request.getEmail(),
                request.getPassword(),
                request.getRole(),
                member);
        return new AuthResponse(appUserRepository.save(user));
    }

    public AuthResponse login(LoginRequest request) {
        AppUser user = appUserRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        if (user.getRole() != request.getRole()) {
            throw new InvalidCredentialsException("Invalid account type selected");
        }

        return new AuthResponse(user);
    }
}
