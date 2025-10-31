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

  # QUERY
  type Query {
    stadions: [Stadion!]
    stadion(stadionId: ID!): Stadion
    fields: [Field!]
    field(fieldId: ID!): Field
    bookings: [Booking!]
    booking(bookingCode: String!): Booking
    facilities: [Facility!]
    me: Admin
    operatingHours: [OperatingHour!]
    operatingHour(stadionId: ID!): OperatingHour!
    adminLogs: [AdminLog!]
    admins: [Admin!]
  }

  # Input
  input BookingDetailInput {
    fieldId: Int!
    bookingDate: DateTime!
    startHour: Int!
    subtotal: Int!
  }

  # Mutation
  type Mutation {
    login(email: String!, password: String!): AuthPayload!

    createStadion(
      name: String!
      description: String
      mapUrl: String!
    ) : Stadion!

    updateStadion (
      stadionId: ID!
      name: String!
      description: String
      mapUrl: String!
    ) : Stadion!

    deleteStadion (
      stadionId: ID!
    ) : Stadion!

    createField(
      name: String!
      stadionId: Int!
      description: String
      pricePerHour: Int!
    ) : Field!

    updateField (
      fieldId: ID!
      name: String!
      stadionId: Int!
      description: String
      pricePerHour: Int!
    ) : Field!

    deleteField (
      fieldId: ID!
    ) : Field!

    bookingField (
      name: String!
      contact: String!
      email: String!
      institution: String
      isAcademic: Boolean
      details: [BookingDetailInput!]!
    ) : Booking!

    updateStatusBooking (
      bookingCode: String!
      status: BookingStatus!
    ) : Booking!

    createOperatingHour (
      stadionId: Int!
      day: DayofWeek!
      openTime: String!
      closeTime: String!
    ) : OperatingHour!

    updateOperatingHour (
      operatingHourId: ID!
      stadionId: Int!
      day: DayofWeek!
      openTime: String!
      closeTime: String!
    ) : OperatingHour!

    deleteOperatingHour (
      operatingHourId: ID!
    ) : OperatingHour!

    uploadImageStadion (
      stadionId: Int!
      imageUrl: String!
    ) : ImageStadion!

    updateImageStadion (
      id: ID!
      imageUrl: String! 
    ) : ImageStadion!

    deleteImageStadion (
      id: ID!
    ) : ImageStadion!

    uploadImageField (
      fieldId: Int!
      imageUrl: String!
    ) : ImageField!

    updateImageField (
      id: ID!
      imageUrl: String! 
    ) : ImageField!

    deleteImageField (
      id: ID!
    ) : ImageField!
    
    createAdminLog (
      adminId: Int!
      action: String!
      targetTable: String
      targetId: String
      description: String
    ) : AdminLog!

    createAdmin (
      name: String!
      password: String!
    ) : Admin!
  }
`