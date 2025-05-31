package com.ved.TradePulse.dtos;

import lombok.Data;

@Data
public class GoogleLoginRequest {
    private String email;
    private String username;
    private String avatarUrl;
}
