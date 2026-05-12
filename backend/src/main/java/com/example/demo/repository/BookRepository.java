package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.Book;

public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByAvailabilityTrue();

    List<Book> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(String title, String author);
}
