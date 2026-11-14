package es.viajesaltairis.backoffice.reservation.dto;

import es.viajesaltairis.backoffice.reservation.ReservationStatus;
import jakarta.validation.constraints.NotNull;

public record ChangeStatusRequest(@NotNull ReservationStatus status) {
}
