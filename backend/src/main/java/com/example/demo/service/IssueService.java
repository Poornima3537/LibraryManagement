package com.example.demo.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.IssueRequest;
import com.example.demo.entity.Book;
import com.example.demo.entity.IssueRecord;
import com.example.demo.entity.Member;
import com.example.demo.exception.BookNotAvailableException;
import com.example.demo.exception.LimitExceededException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.BookRepository;
import com.example.demo.repository.IssueRepository;
import com.example.demo.repository.MemberRepository;

@Service
public class IssueService {

    private static final int MAX_ACTIVE_ISSUES = 3;

    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;
    private final IssueRepository issueRepository;

    public IssueService(BookRepository bookRepository, MemberRepository memberRepository, IssueRepository issueRepository) {
        this.bookRepository = bookRepository;
        this.memberRepository = memberRepository;
        this.issueRepository = issueRepository;
    }

    @Transactional
    public IssueRecord issueBook(IssueRequest request) {
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id " + request.getBookId()));
        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id " + request.getMemberId()));

        if (!book.isAvailability()) {
            throw new BookNotAvailableException("Book is already issued");
        }

        long activeIssues = issueRepository.countByMemberMemberIdAndReturnDateIsNull(member.getMemberId());
        if (activeIssues >= MAX_ACTIVE_ISSUES) {
            throw new LimitExceededException("Member can issue a maximum of 3 books");
        }

        book.setAvailability(false);
        bookRepository.save(book);
        return issueRepository.save(new IssueRecord(book, member, LocalDate.now()));
    }

    @Transactional
    public IssueRecord returnBook(Long issueId) {
        IssueRecord issueRecord = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue record not found with id " + issueId));

        if (issueRecord.getReturnDate() != null) {
            throw new BookNotAvailableException("Book has already been returned");
        }

        issueRecord.setReturnDate(LocalDate.now());
        issueRecord.getBook().setAvailability(true);
        bookRepository.save(issueRecord.getBook());
        return issueRepository.save(issueRecord);
    }

    public List<IssueRecord> getAllIssues() {
        return issueRepository.findAll();
    }
}
