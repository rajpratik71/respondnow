package io.respondnow.controller;

import io.respondnow.dto.incident.*;
import io.respondnow.model.api.Pagination;
import io.respondnow.model.incident.ChannelSource;
import io.respondnow.model.incident.Incident;
import io.respondnow.model.incident.Severity;
import io.respondnow.model.incident.Status;
import io.respondnow.model.incident.Type;
import io.respondnow.model.user.UserDetails;
import io.respondnow.service.incident.IncidentService;
import io.respondnow.util.JWTUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import javax.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Incident Controller", description = "APIs for Incident Management")
@RestController
@RequestMapping("/incident")
public class IncidentController {

  @Autowired private IncidentService incidentService;
  @Autowired private JWTUtil jwtUtil;

  private UserDetails getCurrentUser(HttpServletRequest request) {
    String token = extractToken(request);
    if (token == null) {
      return null;
    }
    UserDetails userDetails = new UserDetails();
    userDetails.setUserId(jwtUtil.getUserIdFromToken(token));
    userDetails.setEmail(jwtUtil.getEmailFromToken(token));
    userDetails.setName(jwtUtil.getNameFromToken(token));
    userDetails.setUserName(jwtUtil.getUsernameFromToken(token));
    
    // Determine source from User-Agent header
    String userAgent = request.getHeader("User-Agent");
    if (userAgent != null && userAgent.toLowerCase().contains("mozilla")) {
      userDetails.setSource(ChannelSource.Web);
    } else {
      userDetails.setSource(ChannelSource.API);
    }
    
    return userDetails;
  }

  private String extractToken(HttpServletRequest request) {
    String bearerToken = request.getHeader("Authorization");
    if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
      return bearerToken.substring(7);
    }
    return null;
  }

  @Operation(summary = "List incidents", description = "List all incidents with optional filters")
  @GetMapping("/list")
  @ResponseStatus(HttpStatus.OK)
  public ListResponseDTO listIncidents(
      @Parameter(
              name = "accountIdentifier",
              description =
                  "accountIdentifier is the account where you want to access the resource",
              in = ParameterIn.QUERY,
              required = false)
          @RequestParam
          String accountIdentifier,
      @Parameter(
              name = "orgIdentifier",
              description = "orgIdentifier is the org where you want to access the resource",
              in = ParameterIn.QUERY)
          @RequestParam(required = false)
          String orgIdentifier,
      @Parameter(
              name = "projectIdentifier",
              description =
                  "projectIdentifier is the project where you want to access the resource",
              in = ParameterIn.QUERY)
          @RequestParam(required = false)
          String projectIdentifier,
      @Parameter(name = "type", description = "type of the incident", in = ParameterIn.QUERY)
          @RequestParam(required = false)
          Type type,
      @Parameter(
              name = "severity",
              description = "severity of the incident",
              in = ParameterIn.QUERY)
          @RequestParam(required = false)
          Severity severity,
      @Parameter(name = "status", description = "status of the incident", in = ParameterIn.QUERY)
          @RequestParam(required = false)
          Status status,
      @Parameter(
              name = "active",
              description = "whether incident is active or not",
              in = ParameterIn.QUERY)
          @RequestParam(required = false)
          Boolean active,
      @Parameter(
              name = "incidentChannelType",
              description = "type of the incident channel",
              in = ParameterIn.QUERY)
          @RequestParam(required = false)
          String incidentChannelType,
      @Parameter(
              name = "search",
              description = "search based on name and/or tags",
              in = ParameterIn.QUERY)
          @RequestParam(required = false)
          String search,
      @Parameter(name = "page", description = "Pagination page, default: 0", in = ParameterIn.QUERY)
          @RequestParam(defaultValue = "0")
          int page,
      @Parameter(
              name = "limit",
              description = "Pagination limit, default: 10",
              in = ParameterIn.QUERY)
          @RequestParam(defaultValue = "10")
          int limit,
      @Parameter(
              name = "all",
              description = "If true, returns all incidents without pagination",
              in = ParameterIn.QUERY)
          @RequestParam(defaultValue = "false")
          boolean all,
      @Parameter(
              name = "correlationId",
              description = "correlationId is used to debug micro service communication",
              in = ParameterIn.QUERY)
          @RequestParam(required = false)
          String correlationId) {
    Criteria criteria = new Criteria();

    criteria.and("accountIdentifier").is(accountIdentifier);

    if (orgIdentifier != null && !orgIdentifier.isEmpty()) {
      criteria.and("orgIdentifier").is(orgIdentifier);
    }
    if (projectIdentifier != null && !projectIdentifier.isEmpty()) {
      criteria.and("projectIdentifier").is(projectIdentifier);
    }
    if (type != null) {
      criteria.and("type").is(type);
    }
    if (severity != null) {
      criteria.and("severity").is(severity);
    }
    if (status != null) {
      criteria.and("status").is(status);
    }
    if (active != null) {
      criteria.and("active").is(active);
    }
    if (incidentChannelType != null && !incidentChannelType.isEmpty()) {
      criteria.and("incidentChannel.type").is(incidentChannelType);
    }
    if (search != null && !search.isEmpty()) {
      criteria.orOperator(
          Criteria.where("name").regex(search, "i"), Criteria.where("tags").regex(search, "i"));
    }

    Query query = new Query(criteria);

    if (!all) {
      query.skip((long) page * limit);
      query.limit(limit);
    }

    List<Incident> incidents = incidentService.listIncidents(query);
    long total = incidentService.countIncidents(query);

    return ListResponseDTO.builder()
        .listResponse(
            ListResponseDTO.ListResponse.builder()
                .content(incidents)
                .pagination(Pagination.builder().totalItems(total).build())
                .correlationID(correlationId)
                .build())
        .build();
  }

  @Operation(summary = "Get incident", description = "Fetch a specific incident by its identifier")
  @GetMapping("/{incidentIdentifier}")
  @ResponseStatus(HttpStatus.OK)
  public GetResponseDTO getIncident(
      @Parameter(
              name = "incidentIdentifier",
              description = "Incident identifier (ObjectId)",
              required = true,
              in = ParameterIn.PATH)
          @PathVariable
          String incidentIdentifier,
      @Parameter(
              name = "accountIdentifier",
              description =
                  "accountIdentifier is the account where you want to access the resource",
              in = ParameterIn.QUERY,
              required = true)
          @RequestParam
          String accountIdentifier,
      @Parameter(
              name = "orgIdentifier",
              description = "orgIdentifier is the org where you want to access the resource",
              in = ParameterIn.QUERY)
          @RequestParam(required = false)
          String orgIdentifier,
      @Parameter(
              name = "projectIdentifier",
              description =
                  "projectIdentifier is the project where you want to access the resource",
              in = ParameterIn.QUERY)
          @RequestParam(required = false)
          String projectIdentifier) {
    Incident incident = incidentService.getIncidentById(incidentIdentifier);
    return GetResponseDTO.builder().incident(incident).build();
  }

  @Operation(summary = "Create incident", description = "Create a new incident")
  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ResponseEntity<CreateResponseDTO> createIncident(
      @RequestBody CreateRequest request,
      HttpServletRequest httpRequest) {
    try {
      UserDetails currentUser = getCurrentUser(httpRequest);
      Incident incident = incidentService.createIncident(request, currentUser);

      CreateResponseDTO.CreateResponse createResponse = new CreateResponseDTO.CreateResponse();
      createResponse.setIncident(incident);

      CreateResponseDTO response = new CreateResponseDTO();
      response.setCreateResponse(createResponse);
      response.setStatus("SUCCESS");
      response.setMessage("Incident created successfully");

      return ResponseEntity.status(HttpStatus.CREATED).body(response);
    } catch (Exception e) {
      CreateResponseDTO response = new CreateResponseDTO();
      response.setStatus("ERROR");
      response.setMessage("Failed to create incident: " + e.getMessage());
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
  }

  @Operation(summary = "Delete incident", description = "Soft delete an incident by its identifier")
  @DeleteMapping("/{incidentIdentifier}")
  @ResponseStatus(HttpStatus.OK)
  public ResponseEntity<DeleteResponseDTO> deleteIncident(
      @Parameter(
              name = "incidentIdentifier",
              description = "Incident identifier",
              required = true,
              in = ParameterIn.PATH)
          @PathVariable
          String incidentIdentifier,
      @Parameter(
              name = "accountIdentifier",
              description = "accountIdentifier is the account where you want to access the resource",
              in = ParameterIn.QUERY,
              required = true)
          @RequestParam
          String accountIdentifier,
      HttpServletRequest httpRequest) {
    try {
      UserDetails currentUser = getCurrentUser(httpRequest);
      incidentService.deleteIncident(incidentIdentifier, currentUser);

      DeleteResponseDTO.DeleteResponse deleteResponse =
          DeleteResponseDTO.DeleteResponse.builder()
              .incidentId(incidentIdentifier)
              .deleted(true)
              .build();

      return ResponseEntity.ok(
          DeleteResponseDTO.builder()
              .data(deleteResponse)
              .status("SUCCESS")
              .message("Incident deleted successfully")
              .build());
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(
              DeleteResponseDTO.builder()
                  .status("ERROR")
                  .message("Failed to delete incident: " + e.getMessage())
                  .build());
    }
  }

  @Operation(summary = "Acknowledge incident", description = "Acknowledge an incident")
  @PutMapping("/{incidentIdentifier}/acknowledge")
  @ResponseStatus(HttpStatus.OK)
  public ResponseEntity<GetResponseDTO> acknowledgeIncident(
      @Parameter(
              name = "incidentIdentifier",
              description = "Incident identifier",
              required = true,
              in = ParameterIn.PATH)
          @PathVariable
          String incidentIdentifier,
      @Parameter(
              name = "accountIdentifier",
              description = "accountIdentifier is the account where you want to access the resource",
              in = ParameterIn.QUERY,
              required = true)
          @RequestParam
          String accountIdentifier,
      HttpServletRequest httpRequest) {
    try {
      UserDetails currentUser = getCurrentUser(httpRequest);
      Incident incident = incidentService.acknowledgeIncident(incidentIdentifier, currentUser);
      return ResponseEntity.ok(
          GetResponseDTO.builder()
              .incident(incident)
              .status("SUCCESS")
              .message("Incident acknowledged successfully")
              .build());
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(
              GetResponseDTO.builder()
                  .status("ERROR")
                  .message("Failed to acknowledge incident: " + e.getMessage())
                  .build());
    }
  }

  @Operation(summary = "Update incident status", description = "Update the status of an incident")
  @PutMapping("/{incidentIdentifier}/status")
  @ResponseStatus(HttpStatus.OK)
  public ResponseEntity<GetResponseDTO> updateIncidentStatus(
      @Parameter(
              name = "incidentIdentifier",
              description = "Incident identifier",
              required = true,
              in = ParameterIn.PATH)
          @PathVariable
          String incidentIdentifier,
      @Parameter(
              name = "accountIdentifier",
              description = "accountIdentifier is the account where you want to access the resource",
              in = ParameterIn.QUERY,
              required = true)
          @RequestParam
          String accountIdentifier,
      @RequestBody UpdateStatusRequest request,
      HttpServletRequest httpRequest) {
    try {
      UserDetails currentUser = getCurrentUser(httpRequest);
      Incident incident =
          incidentService.updateStatus(incidentIdentifier, request.getStatus(), currentUser);
      return ResponseEntity.ok(
          GetResponseDTO.builder()
              .incident(incident)
              .status("SUCCESS")
              .message("Incident status updated successfully")
              .build());
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(
              GetResponseDTO.builder()
                  .status("ERROR")
                  .message("Failed to update incident status: " + e.getMessage())
                  .build());
    }
  }

  @Operation(
      summary = "Update incident severity",
      description = "Update the severity of an incident")
  @PutMapping("/{incidentIdentifier}/severity")
  @ResponseStatus(HttpStatus.OK)
  public ResponseEntity<GetResponseDTO> updateIncidentSeverity(
      @Parameter(
              name = "incidentIdentifier",
              description = "Incident identifier",
              required = true,
              in = ParameterIn.PATH)
          @PathVariable
          String incidentIdentifier,
      @Parameter(
              name = "accountIdentifier",
              description = "accountIdentifier is the account where you want to access the resource",
              in = ParameterIn.QUERY,
              required = true)
          @RequestParam
          String accountIdentifier,
      @RequestBody UpdateSeverityRequest request,
      HttpServletRequest httpRequest) {
    try {
      UserDetails currentUser = getCurrentUser(httpRequest);
      Incident incident =
          incidentService.updateIncidentSeverity(
              incidentIdentifier, request.getSeverity(), currentUser);
      return ResponseEntity.ok(
          GetResponseDTO.builder()
              .incident(incident)
              .status("SUCCESS")
              .message("Incident severity updated successfully")
              .build());
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(
              GetResponseDTO.builder()
                  .status("ERROR")
                  .message("Failed to update incident severity: " + e.getMessage())
                  .build());
    }
  }

  @Operation(summary = "Update incident summary", description = "Update the summary of an incident")
  @PutMapping("/{incidentIdentifier}/summary")
  @ResponseStatus(HttpStatus.OK)
  public ResponseEntity<GetResponseDTO> updateIncidentSummary(
      @Parameter(
              name = "incidentIdentifier",
              description = "Incident identifier",
              required = true,
              in = ParameterIn.PATH)
          @PathVariable
          String incidentIdentifier,
      @Parameter(
              name = "accountIdentifier",
              description = "accountIdentifier is the account where you want to access the resource",
              in = ParameterIn.QUERY,
              required = true)
          @RequestParam
          String accountIdentifier,
      @RequestBody UpdateSummaryRequest request,
      HttpServletRequest httpRequest) {
    try {
      UserDetails currentUser = getCurrentUser(httpRequest);
      Incident incident =
          incidentService.updateSummary(incidentIdentifier, request.getSummary(), currentUser);
      return ResponseEntity.ok(
          GetResponseDTO.builder()
              .incident(incident)
              .status("SUCCESS")
              .message("Incident summary updated successfully")
              .build());
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(
              GetResponseDTO.builder()
                  .status("ERROR")
                  .message("Failed to update incident summary: " + e.getMessage())
                  .build());
    }
  }

  @Operation(summary = "Add comment to incident", description = "Add a comment to an incident")
  @PostMapping("/{incidentIdentifier}/comment")
  @ResponseStatus(HttpStatus.OK)
  public ResponseEntity<GetResponseDTO> addIncidentComment(
      @Parameter(
              name = "incidentIdentifier",
              description = "Incident identifier",
              required = true,
              in = ParameterIn.PATH)
          @PathVariable
          String incidentIdentifier,
      @Parameter(
              name = "accountIdentifier",
              description = "accountIdentifier is the account where you want to access the resource",
              in = ParameterIn.QUERY,
              required = true)
          @RequestParam
          String accountIdentifier,
      @RequestBody AddCommentRequest request,
      HttpServletRequest httpRequest) {
    try {
      UserDetails currentUser = getCurrentUser(httpRequest);
      Incident incident =
          incidentService.addComment(incidentIdentifier, request.getComment(), currentUser);
      return ResponseEntity.ok(
          GetResponseDTO.builder()
              .incident(incident)
              .status("SUCCESS")
              .message("Comment added successfully")
              .build());
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(
              GetResponseDTO.builder()
                  .status("ERROR")
                  .message("Failed to add comment: " + e.getMessage())
                  .build());
    }
  }
}
