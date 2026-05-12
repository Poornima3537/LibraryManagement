package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.entity.IssueRecord;
import com.example.demo.entity.Member;
import com.example.demo.exception.DuplicateResourceException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.IssueRepository;
import com.example.demo.repository.MemberRepository;

@Service
public class MemberService {

    private final MemberRepository memberRepository;
    private final IssueRepository issueRepository;

    public MemberService(MemberRepository memberRepository, IssueRepository issueRepository) {
        this.memberRepository = memberRepository;
        this.issueRepository = issueRepository;
    }

    public Member register(Member member) {
        member.setMemberId(null);
        if (memberRepository.existsByEmailIgnoreCase(member.getEmail())) {
            throw new DuplicateResourceException("Member already exists with email " + member.getEmail());
        }
        return memberRepository.save(member);
    }

    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }

    public Member getMember(Long id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id " + id));
    }

    public List<IssueRecord> getIssuedBooks(Long memberId) {
        getMember(memberId);
        return issueRepository.findByMemberMemberId(memberId);
    }
}
