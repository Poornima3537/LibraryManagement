package com.example.demo.exception;

public class LimitExceededException extends RuntimeException {
    public LimitExceededException(String message) {
        super(message);
    }
}
