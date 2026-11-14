package es.viajesaltairis.backoffice.reservation.dto;

import es.viajesaltairis.backoffice.reservation.ReservationStatus;

public record StatusCount(ReservationStatus status, long count) {
}
