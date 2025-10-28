import { gql } from "graphql-tag"

export default gql`
  scalar DateTime
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
  }

  type ImageStadion {
    id: ID!
    stadionId: Int!
    imageUrl: String!
  }

  type ImageField {
    id: ID!
    fieldId: Int!
    imageUrl: String!
  }

  type Booking {
    id: ID!
    bookingCode: String!
    name: String!
    contact: String!
    email: String!
    institution: String
    isAcademic: Boolean!
    suratUrl: String
    totalPrice: Int!
    status: BookingStatus!
    paymentStatus: PaymentStatus!
    details: [BookingDetail!]
    createdAt: DateTime!
  }

  type BookingDetail {
    id: ID!
    bookingId: Int!
    fieldId: Int!
    bookingDate: DateTime!
    startHour: Int!
    subtotal: Int!
    createdAt: DateTime!
  }

  type OperatingHour {
    id: ID!
    day: DayofWeek!
    openTime: DateTime!
    closeTime: DateTime!
  }

  type AdminLog {
    id: ID!
    adminId: Int!
    action: String!
    targetTable: String
    targetId: Int
    description: String
    createdAt: DateTime!
  }

  type Admin {
    id: ID!
    name: String!
    email: String
    password: String!
    adminLogs: [AdminLog!]
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
    operatingHours: [OperatingHour!]
    operatingHour(stadionId: ID!) : OperatingHour!
    adminLogs: [AdminLog!]
  }

  # Input
  input BookingDetailInput {
    fieldId: Int!
    bookingDate: DateTime!
    startHour: Int!
    subtotal: Int!
  }

  #Enum 
  enum BookingStatus {
    PENDING
    APPROVED
    CANCELLED
    DONE
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

  enum PaymentStatus {
    UNPAID
    PAID
  }

  # Mutation
  type Mutation {
    createStadion (
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
    ) : stadionId!

    createField (
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
    ) : fieldId!

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
    ) : operatingHourId!

    uploadImageStadion (
      stadionId: Int!
      imageUrl: String!
    ) : imageUrl!

    updateImageStadion (
      id: ID!
      imageUrl: String! 
    ) : imageUrl!

    deleteImageStadion (
      id: ID!
    ) id!

    uploadImageField (
      fieldId: Int!
      imageUrl: String!
    ) : imageUrl!

    updateImageField (
      id: ID!
      imageUrl: String! 
    ) : imageUrl!

    deleteImageField (
      id: ID!
    ) id!
    
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
    ) : name!
  }
`