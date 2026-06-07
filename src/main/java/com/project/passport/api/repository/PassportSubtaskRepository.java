package com.project.passport.api.repository;

import com.project.passport.api.model.PassportSubtask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PassportSubtaskRepository extends JpaRepository<PassportSubtask, UUID> {
    List<PassportSubtask> findByTaskIdOrderByOrderNumberAsc(UUID taskId);
}
