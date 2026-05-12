package com.example.demo.dto;

import com.example.demo.entity.AppUser;
import com.example.demo.entity.UserRole;

public class AuthResponse {

    private Long userId;
    private String name;
    private String email;
    private UserRole role;
    private Long memberId;

    public AuthResponse(AppUser user) {
        this.userId = user.getUserId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.memberId = user.getMember() == null ? null : user.getMember().getMemberId();
    }

    public Long getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public UserRole getRole() {
        return role;
    }

    public Long getMemberId() {
        return memberId;
    }
}
