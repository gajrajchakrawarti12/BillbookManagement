package com.billbookmanagement.modules.products.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "product")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    protected Product() {}
    public Long getId() { return id; }
}
