package com.billbookmanagement.modules.business.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "business")
public class Business {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    protected Business() {}
    public Long getId() { return id; }
}
