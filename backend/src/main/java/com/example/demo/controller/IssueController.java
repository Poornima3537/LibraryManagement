package com.example.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.IssueRequest;
import com.example.demo.entity.IssueRecord;
import com.example.demo.service.IssueService;

import jakarta.validation.Valid;

@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
@RestController
@RequestMapping("/issues")
public class IssueController {

    private final IssueService issueService;

    public IssueController(IssueService issueService) {
        this.issueService = issueService;
    }

    @GetMapping
    public List<IssueRecord> getIssues() {
        return issueService.getAllIssues();
    }

    @PostMapping("/issue")
    public IssueRecord issueBook(@Valid @RequestBody IssueRequest request) {
        return issueService.issueBook(request);
    }

    @PutMapping("/return/{issueId}")
    public IssueRecord returnBook(@PathVariable Long issueId) {
        return issueService.returnBook(issueId);
    }
}
