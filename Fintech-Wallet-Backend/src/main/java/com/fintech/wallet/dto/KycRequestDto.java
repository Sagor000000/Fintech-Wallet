package com.fintech.wallet.dto;

import lombok.Data;

@Data
public class KycRequestDto {
    private String nid;
    private String name;
    private String fatherName;
    private String motherName;
    private String dob;
}