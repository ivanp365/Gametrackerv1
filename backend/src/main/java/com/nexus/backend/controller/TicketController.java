package com.nexus.backend.controller;

import com.nexus.backend.model.Ticket;
import com.nexus.backend.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT', 'USER')")
    public ResponseEntity<List<Ticket>> listarTodos() {
        return ResponseEntity.ok(ticketService.listarTodos());
    }

    @GetMapping("/usuario/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT', 'USER')")
    public ResponseEntity<List<Ticket>> listarPorUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.listarPorUsuario(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Ticket> crear(@RequestBody Ticket ticket,
                                         Authentication authentication) {
        return ResponseEntity.ok(ticketService.crear(ticket, authentication.getName()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT')")
    public ResponseEntity<Ticket> actualizar(@PathVariable Long id,
                                              @RequestBody Ticket ticket) {
        return ResponseEntity.ok(ticketService.actualizar(id, ticket));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT')")
    public ResponseEntity<Ticket> cambiarEstado(@PathVariable Long id,
                                                 @RequestParam String estado) {
        return ResponseEntity.ok(ticketService.cambiarEstado(id, estado));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        ticketService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
    @PutMapping("/{id}/responder")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT')")
public ResponseEntity<Ticket> responder(
        @PathVariable Long id,
        @RequestParam String respuesta,
        @RequestParam String estado) {
    return ResponseEntity.ok(ticketService.responder(id, respuesta, estado));
}
}