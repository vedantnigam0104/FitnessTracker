package com.ved.TradePulse.dtos;

import lombok.Data;

@Data
public class UserProfileDTO {
    private String username;   // Editable username
    private String avatarUrl;  // URL or base64 string
    private Double weight;
    private Double height;
    private String gender;
    private Integer age;// "Male", "Female", "Other"
}
