package io.respondnow.dto.incident;

import static org.junit.jupiter.api.Assertions.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

class CreateRequestTest {

  private final ObjectMapper objectMapper = new ObjectMapper();

  @Test
  void testIncidentUrlFieldExists() {
    CreateRequest request = new CreateRequest();
    request.setName("Test Incident");
    request.setSummary("Test Summary");
    request.setIncidentUrl("https://example.com/runbook");

    assertEquals("https://example.com/runbook", request.getIncidentUrl());
  }

  @Test
  void testIncidentUrlSerialization() throws Exception {
    CreateRequest request = new CreateRequest();
    request.setName("Test Incident");
    request.setSummary("Test Summary");
    request.setIncidentUrl("https://example.com/dashboard");

    String json = objectMapper.writeValueAsString(request);
    assertTrue(json.contains("incidentUrl"));
    assertTrue(json.contains("https://example.com/dashboard"));
  }

  @Test
  void testIncidentUrlDeserialization() throws Exception {
    String json = "{\"name\":\"Test\",\"summary\":\"Summary\",\"incidentUrl\":\"https://example.com/incident\"}";
    
    CreateRequest request = objectMapper.readValue(json, CreateRequest.class);
    
    assertEquals("https://example.com/incident", request.getIncidentUrl());
  }

  @Test
  void testIncidentUrlCanBeNull() {
    CreateRequest request = new CreateRequest();
    request.setName("Test Incident");
    request.setSummary("Test Summary");

    assertNull(request.getIncidentUrl());
  }

  @Test
  void testIncidentUrlCanBeEmpty() {
    CreateRequest request = new CreateRequest();
    request.setName("Test Incident");
    request.setSummary("Test Summary");
    request.setIncidentUrl("");

    assertEquals("", request.getIncidentUrl());
  }
}
