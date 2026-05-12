package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.IssueRecord;

public interface IssueRepository extends JpaRepository<IssueRecord, Long> {
    long countByMemberMemberIdAndReturnDateIsNull(Long memberId);

    List<IssueRecord> findByMemberMemberId(Long memberId);

    List<IssueRecord> findByMemberMemberIdAndReturnDateIsNull(Long memberId);
}
