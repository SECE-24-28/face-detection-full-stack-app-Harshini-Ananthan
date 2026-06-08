export const typeDefs = `
  type BoundingBox {
    top: Float!
    left: Float!
    width: Float!
    height: Float!
  }

  type DetectionResult {
    imageUrl: String!
    faceCount: Int!
    faces: [BoundingBox!]!
  }

  type Query {
    _empty: String
  }

  type Mutation {
    detectFace(imageUrl: String!): DetectionResult!
  }
`;
