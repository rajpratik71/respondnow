package io.respondnow.dto.incident;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.respondnow.model.incident.Severity;
import io.respondnow.model.incident.Status;
import io.respondnow.model.incident.Type;
import java.util.List;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ExportRequest {

  @JsonProperty("incidentIds")
  private List<String> incidentIds;

  @JsonProperty("type")
  private Type type;

  @JsonProperty("severity")
  private Severity severity;

  @JsonProperty("status")
  private Status status;

  @JsonProperty("active")
  private Boolean active;

  @JsonProperty("search")
  private String search;

  @JsonProperty("startDate")
  private Long startDate;

  @JsonProperty("endDate")
  private Long endDate;

  @JsonProperty("exportAll")
  private Boolean exportAll;

  @JsonProperty("format")
  private String format; // "csv" or "pdf"
}
