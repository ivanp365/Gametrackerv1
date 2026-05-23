package com.nexus.backend.service;

import com.nexus.backend.model.Ticket;
import com.nexus.backend.model.User;
import com.nexus.backend.repository.TicketRepository;
import com.nexus.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Ticket> listarTodos() {
        return ticketRepository.findAll();
    }

    public List<Ticket> listarPorUsuario(Long usuarioId) {
        return ticketRepository.findByUsuarioId(usuarioId);
    }

    public Ticket crear(Ticket ticket, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        ticket.setUsuario(user);
        ticket.setEstado(Ticket.Estado.ABIERTO);
        return ticketRepository.save(ticket);
    }

    public Ticket actualizar(Long id, Ticket ticketActualizado) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        ticket.setTitulo(ticketActualizado.getTitulo());
        ticket.setDescripcion(ticketActualizado.getDescripcion());
        ticket.setPrioridad(ticketActualizado.getPrioridad());
        ticket.setEstado(ticketActualizado.getEstado());
        ticket.setCategoria(ticketActualizado.getCategoria());
        return ticketRepository.save(ticket);
    }
    public Ticket cambiarEstado(Long id, String estado) {
    Ticket ticket = ticketRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
    ticket.setEstado(Ticket.Estado.valueOf(estado));
    return ticketRepository.save(ticket);
}
public Ticket responder(Long id, String respuesta, String estado) {
    Ticket ticket = ticketRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
    ticket.setRespuesta(respuesta);
    ticket.setEstado(Ticket.Estado.valueOf(estado));
    return ticketRepository.save(ticket);
}

    public void eliminar(Long id) {
        ticketRepository.deleteById(id);
        
    }
}