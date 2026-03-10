package com.knowvera.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.knowvera.model.Fine;
import com.knowvera.repository.FineRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FineService {

    private final FineRepository fineRepository;
    private final OverdueFineService overdueFineService;

    public List<Fine> getAllFines() {
        overdueFineService.refreshOverdueForActiveIssues();
        return fineRepository.findAll();
    }

    public List<Fine> getFinesByUserId(Integer userId) {
        overdueFineService.refreshOverdueForActiveIssues();
        return fineRepository.findByIssueUserUserId(userId);
    }
}
