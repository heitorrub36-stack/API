package com.project.passport.api.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.passport.api.dto.DocumentCategoryDto;
import com.project.passport.api.model.DocumentCategory;
import com.project.passport.api.services.DocumentCategoryService;

@RestController
@RequestMapping("/api/document-categories")
public class DocumentCategoryController {

    private final DocumentCategoryService documentCategoryService;

    public DocumentCategoryController(DocumentCategoryService documentCategoryService) {
        this.documentCategoryService = documentCategoryService;
    }

    @GetMapping
    public List<DocumentCategory> getAllDocumentCategories() {
        return documentCategoryService.getAllDocumentCategories();
    }

    @GetMapping("/{id}")
    public DocumentCategory getDocumentCategoryById(@PathVariable UUID id) {
        return documentCategoryService.getDocumentCategoryById(id);
    }

    @PostMapping
    public DocumentCategory createDocumentCategory(@RequestBody DocumentCategoryDto dto) {
        return documentCategoryService.createDocumentCategory(dto);
    }

    @PutMapping("/{id}")
    public DocumentCategory updateDocumentCategory(@PathVariable UUID id,
            @RequestBody DocumentCategoryDto dto) {
        return documentCategoryService.updateDocumentCategory(id, dto);
    }

    @DeleteMapping("/{id}")
    public void deleteDocumentCategory(@PathVariable UUID id) {
        documentCategoryService.deleteDocumentCategory(id);
    }
}
