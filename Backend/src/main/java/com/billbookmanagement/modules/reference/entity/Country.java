package com.billbookmanagement.modules.reference.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "country")
public class Country {
    @Id
    @Column(length = 2)
    private String code;
    protected Country() {}
    public String getCode() { return code; }
}
