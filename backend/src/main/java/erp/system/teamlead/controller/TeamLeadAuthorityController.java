package erp.system.teamlead.controller;

import erp.system.teamlead.dto.TeamLeadAuthorityResponse;
import erp.system.teamlead.service.TeamLeadAuthorityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/team-lead-authorities")
@RequiredArgsConstructor
public class TeamLeadAuthorityController {

    private final TeamLeadAuthorityService teamLeadAuthorityService;

    @GetMapping
    public List<TeamLeadAuthorityResponse> getList() {
        return teamLeadAuthorityService.listActive();
    }

    @PostMapping("/{employeeId}")
    public ResponseEntity<Void> grant(@PathVariable Long employeeId, @AuthenticationPrincipal Long actorId) {
        teamLeadAuthorityService.grant(employeeId, actorId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{employeeId}")
    public ResponseEntity<Void> revoke(@PathVariable Long employeeId, @AuthenticationPrincipal Long actorId) {
        teamLeadAuthorityService.revoke(employeeId, actorId);
        return ResponseEntity.noContent().build();
    }
}
