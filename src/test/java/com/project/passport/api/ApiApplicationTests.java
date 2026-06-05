package com.project.passport.api;

import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;
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

import com.project.passport.api.enums.ManagerDecision;
import com.project.passport.api.enums.MedicalResult;
import com.project.passport.api.enums.PassportStatus;
import com.project.passport.api.repository.PassportRepository;

@SpringBootTest
@AutoConfigureMockMvc
class ApiApplicationTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private PassportRepository passportRepository;

	@BeforeEach
	void setUp() {
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

	private void assertBadRequestFor(String content) throws Exception {
		mockMvc.perform(post("/api/passports")
				.contentType(MediaType.APPLICATION_JSON)
				.content(content))
				.andExpect(status().isBadRequest());

		assertThat(passportRepository.findAll()).isEmpty();
	}
}
