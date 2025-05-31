package com.ved.TradePulse.entity;

import com.ved.TradePulse.domain.VerificationType;

import jakarta.persistence.Embeddable;
import jakarta.persistence.Embedded;
import lombok.Data;
@Embeddable
@Data
public class TwoFactorAuth {
    private boolean isEnabled = false;
    private VerificationType sendTo;
}
