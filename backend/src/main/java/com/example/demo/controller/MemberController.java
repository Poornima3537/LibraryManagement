package com.example.demo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.IssueRecord;
import com.example.demo.entity.Member;
import com.example.demo.service.MemberService;

import jakarta.validation.Valid;

@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
@RestController
@RequestMapping("/members")
public class MemberController {

    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Member registerMember(@Valid @RequestBody Member member) {
        return memberService.register(member);
    }

    @GetMapping
    public List<Member> getMembers() {
        return memberService.getAllMembers();
    }

    @GetMapping("/{memberId}")
    public Member getMember(@PathVariable Long memberId) {
        return memberService.getMember(memberId);
    }

    @GetMapping("/{memberId}/issues")
    public List<IssueRecord> getMemberIssues(@PathVariable Long memberId) {
        return memberService.getIssuedBooks(memberId);
    }
}
