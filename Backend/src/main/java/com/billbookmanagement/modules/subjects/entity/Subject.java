package com.billbookmanagement.modules.subjects.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "subject")
public class Subject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    protected Subject() {}
    public Long getId() { return id; }
}
