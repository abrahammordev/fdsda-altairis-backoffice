package es.viajesaltairis.backoffice.reservation;

/**
 * Ciclo de vida de una reserva. PENDING y CONFIRMED ocupan inventario; CANCELLED lo libera.
 * Transiciones válidas: PENDING → CONFIRMED, PENDING/CONFIRMED → CANCELLED.
 */
public enum ReservationStatus {
    PENDING,
    CONFIRMED,
    CANCELLED;

    public boolean canTransitionTo(ReservationStatus target) {
        return switch (this) {
            case PENDING -> target == CONFIRMED || target == CANCELLED;
            case CONFIRMED -> target == CANCELLED;
            case CANCELLED -> false;
        };
    }

    public boolean holdsInventory() {
        return this != CANCELLED;
    }
}
