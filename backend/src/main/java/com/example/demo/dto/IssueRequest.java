package com.example.demo.dto;

import jakarta.validation.constraints.NotNull;

public class IssueRequest {

    @NotNull(message = "Book id is required")
    private Long bookId;

    @NotNull(message = "Member id is required")
    private Long memberId;

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }

    public Long getMemberId() {
        return memberId;
    }

    public void setMemberId(Long memberId) {
        this.memberId = memberId;
    }
}
