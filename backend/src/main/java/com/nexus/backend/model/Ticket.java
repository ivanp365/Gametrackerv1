package com.nexus.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(length = 1000)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    private Prioridad prioridad;

    @Enumerated(EnumType.STRING)
    private Estado estado;

    private String categoria;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private User usuario;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    @Column(length = 1000)
private String respuesta;

    public enum Prioridad {
        BAJA, MEDIA, ALTA, CRITICA
    }

    public enum Estado {
        ABIERTO, EN_PROGRESO, RESUELTO, CERRADO
    }
}