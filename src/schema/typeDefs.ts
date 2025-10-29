import { gql } from "graphql-tag"

export default gql`
  scalar DateTime

  enum BookingStatus {
    PENDING
    APPROVED
    CANCELLED
    DONE
  }

  enum PaymentStatus {
    UNPAID
    PAID
  }

  enum DayofWeek {
    SENIN
    SELASA
    RABU
    KAMIS
    JUMAT
    SABTU
    MINGGU
  }

  type Stadion {
    id: ID!
    name: String!
    description: String
    mapUrl: String!
    facilities: [StadionFacility!]
    fields: [Field!]
    images: [ImageStadion!]
    operatingHours: [OperatingHour!]
  }

  type StadionFacility {
    id: ID!
    stadionId: Int!
    facilityId: Int!
    Stadion: Stadion
    Facility: Facility
  }

  type Facility {
    id: ID!
    name: String!
    stadionFacilities: [StadionFacility!]
  }

  type Field {
    id: ID!
    stadionId: Int!
    name: String!
    description: String
    pricePerHour: Int!
    images: [ImageField!]
    bookingDetails: [BookingDetail!]
    Stadion: Stadion
  }

  type ImageStadion {
    id: ID!
    stadionId: Int!
    imageUrl: String!
    Stadion: Stadion
  }

  type ImageField {
    id: ID!
    fieldId: Int!
    imageUrl: String!
    Field: Field
  }

  type Booking {
    id: ID!
    bookingCode: String!
    name: String!
    contact: String!
    email: String!
    institution: String
    suratUrl: String
    isAcademic: Boolean!
    totalPrice: Int!
    status: BookingStatus!
    paymentStatus: PaymentStatus!
    createdAt: DateTime!
    details: [BookingDetail!]
  }

  type BookingDetail {
    id: ID!
    bookingId: Int!
    fieldId: Int!
    bookingDate: DateTime!
    startHour: Int!
    pricePerHour: Int!
    subtotal: Int!
    createdAt: DateTime!
    Booking: Booking
    Field: Field
  }

  type OperatingHour {
    id: ID!
    stadionId: Int!
    day: DayofWeek!
    openTime: DateTime!
    closeTime: DateTime!
    Stadion: Stadion
  }

  type AdminLog {
    id: ID!
    adminId: Int!
    action: String!
    targetTable: String
    targetId: Int
    description: String
    createdAt: DateTime!
    Admin: Admin
  }

  type Admin {
    id: ID!
    name: String!
    email: String
    adminLogs: [AdminLog!]
  }

  type AuthPayload {
    token: String!
    admin: Admin!
  }

  # QUERY
  type Query {
    stadions: [Stadion!]
    stadion(stadionId: ID!): Stadion
    fields: [Field!]
    field(fieldId: ID!): Field
    bookings: [Booking!]
    booking(id: ID!): Booking
    facilities: [Facility!]
    me: Admin
  }

  # Mutation
  input InputField {
    name: String!
    description: String
    pricePerHour: Int!
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload!

    createStadion(
      name: String!
      description: String
      mapUrl: String!
    ): Stadion!

    createField(
      id: ID!
      name: String!
      description: String
      pricePerHour: Int!
    ): Field!
  }
`
