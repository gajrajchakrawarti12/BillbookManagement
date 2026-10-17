package com.billbookmanagement.modules.invoices.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "invoice")
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    protected Invoice() {}
    public Long getId() { return id; }
}
