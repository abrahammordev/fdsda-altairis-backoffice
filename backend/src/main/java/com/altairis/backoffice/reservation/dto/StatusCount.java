package com.altairis.backoffice.reservation.dto;

import com.altairis.backoffice.reservation.ReservationStatus;

public record StatusCount(ReservationStatus status, long count) {
}
