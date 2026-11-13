package com.altairis.backoffice.reservation.dto;

import com.altairis.backoffice.reservation.ReservationStatus;
import jakarta.validation.constraints.NotNull;

public record ChangeStatusRequest(@NotNull ReservationStatus status) {
}
