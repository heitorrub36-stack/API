package com.project.passport.api;

import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.project.passport.api.enums.ArtifactsStatus;
import com.project.passport.api.enums.ManagerDecision;
import com.project.passport.api.enums.MedicalResult;
import com.project.passport.api.enums.PassportStatus;
import com.project.passport.api.model.Artifact;
import com.project.passport.api.model.Passport;
import com.project.passport.api.repository.ArtifactRepository;
import com.project.passport.api.repository.PassportRepository;

@SpringBootTest
@AutoConfigureMockMvc
class ApiApplicationTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private PassportRepository passportRepository;

	@Autowired
	private ArtifactRepository artifactRepository;

	@BeforeEach
	void setUp() {
		artifactRepository.deleteAll();
		passportRepository.deleteAll();
	}

	@Test
	void contextLoads() {
	}

	@Test
	void createPassportWithValidData() throws Exception {
		mockMvc.perform(post("/api/passports")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "candidateName": "Maria Silva",
						  "candidateCpf": "12345678900",
						  "jobPosition": "Analista de RH"
						}
						"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id", notNullValue()))
				.andExpect(jsonPath("$.candidateName").value("Maria Silva"))
				.andExpect(jsonPath("$.candidateCpf").value("12345678900"))
				.andExpect(jsonPath("$.jobPosition").value("Analista de RH"))
				.andExpect(jsonPath("$.createdAt").value(LocalDate.now().toString()))
				.andExpect(jsonPath("$.status").value(PassportStatus.ABERTA.name()))
				.andExpect(jsonPath("$.medicalResult").value(MedicalResult.PENDENTE.name()))
				.andExpect(jsonPath("$.managerDecision").value(ManagerDecision.PENDENTE.name()))
				.andExpect(jsonPath("$.medicalNotes", nullValue()))
				.andExpect(jsonPath("$.managerNotes", nullValue()));

		assertThat(passportRepository.findAll())
				.singleElement()
				.satisfies(passport -> {
					assertThat(passport.getCandidateName()).isEqualTo("Maria Silva");
					assertThat(passport.getCandidateCpf()).isEqualTo("12345678900");
					assertThat(passport.getJobPosition()).isEqualTo("Analista de RH");
					assertThat(passport.getStatus()).isEqualTo(PassportStatus.ABERTA);
					assertThat(passport.getMedicalResult()).isEqualTo(MedicalResult.PENDENTE);
					assertThat(passport.getManagerDecision()).isEqualTo(ManagerDecision.PENDENTE);
				});
	}

	@Test
	void rejectPassportWithoutCandidateName() throws Exception {
		assertBadRequestFor("""
				{
				  "candidateCpf": "12345678900",
				  "jobPosition": "Analista de RH"
				}
				""");
	}

	@Test
	void rejectPassportWithoutCandidateCpf() throws Exception {
		assertBadRequestFor("""
				{
				  "candidateName": "Maria Silva",
				  "jobPosition": "Analista de RH"
				}
				""");
	}

	@Test
	void rejectPassportWithoutJobPosition() throws Exception {
		assertBadRequestFor("""
				{
				  "candidateName": "Maria Silva",
				  "candidateCpf": "12345678900"
				}
				""");
	}

	@Test
	void rejectEmptyPassportBody() throws Exception {
		assertBadRequestFor("{}");
	}

	@Test
	void createArtifactWithValidData() throws Exception {
		Passport passport = savePassport();

		mockMvc.perform(post("/api/artifacts")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "passportId": "%s",
						  "documentName": "ASO",
						  "fileName": "aso.pdf",
						  "fileType": "application/pdf",
						  "notes": "Documento recebido"
						}
						""".formatted(passport.getId())))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.id", notNullValue()))
				.andExpect(jsonPath("$.doucumentName").value("ASO"))
				.andExpect(jsonPath("$.fileName").value("aso.pdf"))
				.andExpect(jsonPath("$.fileType").value("application/pdf"))
				.andExpect(jsonPath("$.status").value(ArtifactsStatus.PENDENTE.name()))
				.andExpect(jsonPath("$.passport.id").value(passport.getId().toString()));

		assertThat(artifactRepository.findAll())
				.singleElement()
				.satisfies(artifact -> {
					assertThat(artifact.getDoucumentName()).isEqualTo("ASO");
					assertThat(artifact.getStatus()).isEqualTo(ArtifactsStatus.PENDENTE);
					assertThat(artifact.getPassport().getId()).isEqualTo(passport.getId());
				});
	}

	@Test
	void getArtifactsByPassportId() throws Exception {
		Passport passport = savePassport();
		saveArtifact(passport);

		mockMvc.perform(get("/api/artifacts/passport/{passportId}", passport.getId()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].id", notNullValue()))
				.andExpect(jsonPath("$[0].status").value(ArtifactsStatus.PENDENTE.name()))
				.andExpect(jsonPath("$[0].passport.id").value(passport.getId().toString()));
	}

	@Test
	void validateArtifactMapping() throws Exception {
		Artifact artifact = saveArtifact(savePassport());

		mockMvc.perform(patch("/api/artifacts/validate/{id}", artifact.getId()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value(ArtifactsStatus.VALIDADO.name()))
				.andExpect(jsonPath("$.invalidationReason", nullValue()));

		assertThat(artifactRepository.findById(artifact.getId()))
				.get()
				.extracting(Artifact::getStatus)
				.isEqualTo(ArtifactsStatus.VALIDADO);
	}

	@Test
	void invalidateArtifactMapping() throws Exception {
		Artifact artifact = saveArtifact(savePassport());

		mockMvc.perform(patch("/api/artifacts/{id}/invalidate", artifact.getId())
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "reason": "Documento ilegível"
						}
						"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value(ArtifactsStatus.INVALIDADO.name()))
				.andExpect(jsonPath("$.invalidationReason").value("Documento ilegível"));

		assertThat(artifactRepository.findById(artifact.getId()))
				.get()
				.satisfies(savedArtifact -> {
					assertThat(savedArtifact.getStatus()).isEqualTo(ArtifactsStatus.INVALIDADO);
					assertThat(savedArtifact.getInvalidationReason()).isEqualTo("Documento ilegível");
				});
	}

	private void assertBadRequestFor(String content) throws Exception {
		mockMvc.perform(post("/api/passports")
				.contentType(MediaType.APPLICATION_JSON)
				.content(content))
				.andExpect(status().isBadRequest());

		assertThat(passportRepository.findAll()).isEmpty();
	}

	private Passport savePassport() {
		Passport passport = new Passport();
		passport.setCandidateName("Maria Silva");
		passport.setCandidateCpf("12345678900");
		passport.setJobPosition("Analista de RH");
		passport.setCreatedAt(LocalDate.now());
		passport.setStatus(PassportStatus.ABERTA);
		passport.setMedicalResult(MedicalResult.PENDENTE);
		passport.setManagerDecision(ManagerDecision.PENDENTE);

		return passportRepository.save(passport);
	}

	private Artifact saveArtifact(Passport passport) {
		Artifact artifact = new Artifact();
		artifact.setPassport(passport);
		artifact.setDoucumentName("ASO");
		artifact.setFileName("aso.pdf");
		artifact.setFileType("application/pdf");
		artifact.setUploadDate(LocalDate.now());
		artifact.setStatus(ArtifactsStatus.PENDENTE);

		return artifactRepository.save(artifact);
	}
}
