package com.billbookmanagement.modules.payments.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "payment")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    protected Payment() {}
    public Long getId() { return id; }
}
