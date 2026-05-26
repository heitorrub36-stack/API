package com.project.passport.api.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.project.passport.api.model.DocumentCategory;

public interface DocumentCategoryRepository extends JpaRepository<DocumentCategory, UUID> {
}
