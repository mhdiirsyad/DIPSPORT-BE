import { gql } from "graphql-tag"

export default gql`
  scalar DateTime
  scalar Upload

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
  }

  type OperatingHour {
    id: ID!
    day: DayofWeek!
    openTime: DateTime!
    closeTime: DateTime!
    stadionId: Int!
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

  type uploadResponse {
    count: Int!
    imageUrls: [String!]!
  }

  type Query {
    stadions: [Stadion!]
    stadion(stadionId: ID!): Stadion
    fields(stadionId: ID): [Field!]
    field(fieldId: ID!): Field
    bookings: [Booking!]
    booking(bookingCode: String!): Booking
    operatingHoursByStadion(stadionId: Int!): [OperatingHour]
    me: Admin
  }

  input FieldImageInput {
    imageUrl: String!
  }

  input BookingDetailInput {
    fieldId: Int!
    bookingDate: DateTime!
    startHour: Int!
    pricePerHour: Int
    subtotal: Int
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload!
    logout: Boolean!

    createStadion(
      name: String!
      description: String
      mapUrl: String!
    ): Stadion!

    updateStadion(
      stadionId: ID!
      name: String!
      description: String
      mapUrl: String!
    ): Stadion!

    deleteStadion(
      stadionId: ID!
    ): Stadion!

    createField(
      stadionId: Int!
      name: String!
      description: String
      pricePerHour: Int!
      images: [FieldImageInput!]
    ): Field!

    updateField(
      fieldId: ID!
      stadionId: Int!
      name: String!
      description: String
      pricePerHour: Int!
      images: [FieldImageInput!]
    ): Field!

    deleteField(
      fieldId: ID!
    ): Field!

    createBooking(
      name: String!
      contact: String!
      email: String!
      institution: String
      suratUrl: String
      isAcademic: Boolean
      details: [BookingDetailInput!]!
    ): Booking!

    updateStatusBooking(
      bookingCode: String!
      status: BookingStatus!
    ): Booking!

    updatePaymentStatus(
      bookingCode: String!
      paymentStatus: PaymentStatus!
    ): Booking!

    createOperatingHour(
      stadionId: Int! 
      day: DayofWeek!
      openTime: DateTime!
      closeTime: DateTime!
    ): OperatingHour

    updateOperatingHour(
      id: Int!
      day: DayofWeek!
      openTime: DateTime!
      closeTime: DateTime!
    ): OperatingHour

    deleteOperatingHour(
      id: Int!
    ): OperatingHour

    uploadStadionImages(
      stadionId: Int!
      files: [Upload!]!
    ): uploadResponse!

    uploadFieldImages(
      stadionId: Int!
      files: [Upload!]!
    ): uploadResponse!
  }
`
