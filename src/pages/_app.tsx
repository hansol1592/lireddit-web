import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { ColorModeProvider, CSSReset, ThemeProvider } from "@chakra-ui/core";
import theme from "../theme";
import { PaginatedPosts } from "../generated/graphql";

function MyApp({ Component, pageProps }: any) {
  return (
    <ThemeProvider theme={theme}>
      <ColorModeProvider>
        <CSSReset />
        <Component {...pageProps} />
      </ColorModeProvider>
    </ThemeProvider>
  );
}

export default MyApp;
