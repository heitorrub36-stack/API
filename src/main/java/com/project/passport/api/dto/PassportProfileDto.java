package com.project.passport.api.dto;

public class PassportProfileDto {

    private String name;
    private String description;
    private Integer version;
    private Boolean published;
    private Boolean active;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }
    public Boolean getPublished() { return published; }
    public void setPublished(Boolean published) { this.published = published; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
