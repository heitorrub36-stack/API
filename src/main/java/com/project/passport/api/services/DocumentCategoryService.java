package com.project.passport.api.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.project.passport.api.dto.DocumentCategoryDto;
import com.project.passport.api.model.DocumentCategory;
import com.project.passport.api.repository.DocumentCategoryRepository;

@Service
public class DocumentCategoryService {

    private final DocumentCategoryRepository documentCategoryRepository;

    public DocumentCategoryService(DocumentCategoryRepository documentCategoryRepository) {
        this.documentCategoryRepository = documentCategoryRepository;
    }

    public List<DocumentCategory> getAllDocumentCategories() {
        return documentCategoryRepository.findAll();
    }

    public DocumentCategory getDocumentCategoryById(UUID id) {
        return documentCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document Category not found with id: " + id));

    }

    public DocumentCategory createDocumentCategory(DocumentCategoryDto dto) {
        DocumentCategory documentCategory = new DocumentCategory();
        documentCategory.setName(dto.getName());
        documentCategory.setDescription(dto.getDescription());
        documentCategory.setPermitType(dto.getPermitType());
        documentCategory.setActive(dto.isActive());

        return documentCategoryRepository.save(documentCategory);
    }

    public DocumentCategory updateDocumentCategory(UUID id, DocumentCategoryDto dto) {
        DocumentCategory documentCategory = getDocumentCategoryById(id);

        documentCategory.setName(dto.getName());
        documentCategory.setDescription(dto.getDescription());
        documentCategory.setPermitType(dto.getPermitType());
        documentCategory.setActive(dto.isActive());

        return documentCategoryRepository.save(documentCategory);
    }

    public void deleteDocumentCategory(UUID id) {
        DocumentCategory documentCategory = getDocumentCategoryById(id);
        documentCategoryRepository.delete(documentCategory);
    }
}
