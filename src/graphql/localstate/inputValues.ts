import { makeVar, gql } from "@apollo/client";

export const INPUT_VALUES = gql`
  query GetInputValues {
    values {
      title @client
      text @client
    }
  }
`;

export const inputFields = makeVar({
  title: "",
  text: "",
});
