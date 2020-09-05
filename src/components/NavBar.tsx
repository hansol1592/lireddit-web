import React from "react";
import { Flex, Box, Link, Button } from "@chakra-ui/core";
import NextLink from "next/link";
import { useMeQuery, useLogoutMutation } from "../generated/graphql";

function NavBar() {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery();
  let body = null;

  // data is loading
  if (fetching) {
    // user not logged in
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link mr={2}>login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>register</Link>
        </NextLink>
      </>
    );

    // user is logged in
  } else {
    body = (
      <Flex>
        <Box mr={2}>{data.me.username}</Box>
        <Button
          variant="link"
          onClick={() => {
            logout();
          }}
          isLoading={logoutFetching}
        >
          logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex bg="tan" p={4}>
      <Box ml={"auto"}>{body}</Box>
    </Flex>
  );
}

export default NavBar;
