package com.example.demo.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.example.demo.entity.AppUser;
import com.example.demo.entity.Book;
import com.example.demo.entity.Member;
import com.example.demo.entity.UserRole;
import com.example.demo.repository.AppUserRepository;
import com.example.demo.repository.BookRepository;
import com.example.demo.repository.MemberRepository;

@Component
public class DataSeeder implements CommandLineRunner {

    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;
    private final AppUserRepository appUserRepository;

    public DataSeeder(BookRepository bookRepository, MemberRepository memberRepository, AppUserRepository appUserRepository) {
        this.bookRepository = bookRepository;
        this.memberRepository = memberRepository;
        this.appUserRepository = appUserRepository;
    }

    @Override
    public void run(String... args) {
        migrateSampleEmail("librarian@example.com", "librarian@gmail.com");
        migrateSampleEmail("aarav@example.com", "aarav@gmail.com");
        migrateSampleEmail("meera@example.com", "meera@gmail.com");

        if (bookRepository.count() == 0) {
            bookRepository.save(new Book("Clean Code", "Robert C. Martin"));
            bookRepository.save(new Book("Effective Java", "Joshua Bloch"));
            bookRepository.save(new Book("Spring in Action", "Craig Walls"));
            bookRepository.save(new Book("Introduction to Algorithms", "Thomas H. Cormen"));
        }

        if (memberRepository.count() == 0) {
            memberRepository.save(new Member("Aarav Sharma", "aarav@gmail.com"));
            memberRepository.save(new Member("Meera Iyer", "meera@gmail.com"));
        }

        if (!appUserRepository.existsByRole(UserRole.LIBRARIAN)) {
            appUserRepository.save(new AppUser("Library Admin", "librarian@gmail.com", "admin123", UserRole.LIBRARIAN, null));
        }

        memberRepository.findByEmailIgnoreCase("aarav@gmail.com").ifPresent(member -> {
            if (!appUserRepository.existsByEmailIgnoreCase(member.getEmail())) {
                appUserRepository.save(new AppUser(member.getName(), member.getEmail(), "member123", UserRole.MEMBER, member));
            }
        });

        memberRepository.findByEmailIgnoreCase("meera@gmail.com").ifPresent(member -> {
            if (!appUserRepository.existsByEmailIgnoreCase(member.getEmail())) {
                appUserRepository.save(new AppUser(member.getName(), member.getEmail(), "member123", UserRole.MEMBER, member));
            }
        });
    }

    private void migrateSampleEmail(String oldEmail, String newEmail) {
        if (!appUserRepository.existsByEmailIgnoreCase(newEmail)) {
            appUserRepository.findByEmailIgnoreCase(oldEmail).ifPresent(user -> {
                user.setEmail(newEmail);
                appUserRepository.save(user);
            });
        }

        if (!memberRepository.existsByEmailIgnoreCase(newEmail)) {
            memberRepository.findByEmailIgnoreCase(oldEmail).ifPresent(member -> {
                member.setEmail(newEmail);
                memberRepository.save(member);
            });
        }
    }
}
