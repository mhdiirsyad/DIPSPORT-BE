import {gql} from "graphql-tag"
import {DateTimeResolver} from "graphql-scalars"

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
    totalPrice: Int!
    status: String!
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
  }

  type OperatingHour {
    id: ID!
    day: String!
    openTime: String!
    closeTime: String!
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
    booking(id: ID!): Booking
    facilities: [Facility!]
  }

  # Mutation
  input InputField {
    name: String!
    description: String
    pricePerHour: Int!
  }

  type Mutation {
    createStadion (
      name: String!
      description: String
      mapUrl: String!
     ) : Stadion!

     createField (
      id: ID!
      name: String!
      description: String
      pricePerHour: Int!
     ) : Field!
  }
`