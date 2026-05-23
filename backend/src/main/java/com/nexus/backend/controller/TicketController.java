package com.nexus.backend.controller;

import com.nexus.backend.model.Ticket;
import com.nexus.backend.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @GetMapping
    public ResponseEntity<List<Ticket>> listarTodos() {
        return ResponseEntity.ok(ticketService.listarTodos());
    }

    @GetMapping("/usuario/{id}")
    public ResponseEntity<List<Ticket>> listarPorUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.listarPorUsuario(id));
    }

    @PostMapping
    public ResponseEntity<Ticket> crear(@RequestBody Ticket ticket,
                                         Authentication authentication) {
        return ResponseEntity.ok(ticketService.crear(ticket, authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ticket> actualizar(@PathVariable Long id,
                                              @RequestBody Ticket ticket) {
        return ResponseEntity.ok(ticketService.actualizar(id, ticket));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        ticketService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}