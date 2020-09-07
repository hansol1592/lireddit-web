import { makeVar, gql } from "@apollo/client";

export const DATA_LIST = gql`
  query GetDataList {
    datalist @client
  }
`;

export const datalistVar = makeVar<any>([]);
