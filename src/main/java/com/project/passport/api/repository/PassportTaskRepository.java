package com.project.passport.api.repository;

import com.project.passport.api.model.PassportTask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PassportTaskRepository extends JpaRepository<PassportTask, UUID> {
    List<PassportTask> findByActivityIdOrderByOrderNumberAsc(UUID activityId);
    List<PassportTask> findByActivityPassportId(UUID passportId);
}
