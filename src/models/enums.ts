export enum SystemRole {
  ADMIN = 'ADMIN',
  ORGANIZER = 'ORGANIZER',
  USER = 'USER',
}

export enum EventStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING',
  APPROVED = 'APPROVED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum TicketStatus {
  DRAFT = 'DRAFT',
  ON_SALE = 'ON_SALE',
  SOLD_OUT = 'SOLD_OUT',
  CLOSED = 'CLOSED',
}

export enum TicketType {
  REGULAR = 'REGULAR',
  VIP = 'VIP',
  EARLY_BIRD = 'EARLY_BIRD',
  STUDENT = 'STUDENT',
  GROUP = 'GROUP',
  SPONSOR = 'SPONSOR',
  FREE = 'FREE',
}

export enum StaffRole {
  MANAGER = 'MANAGER',
  CHECKER = 'CHECKER',
}

export enum EntryType {
  IN = 'IN',
  OUT = 'OUT',
}

export enum CheckInMethod {
  QR_SCAN = 'QR_SCAN',
  MANUAL = 'MANUAL',
}
