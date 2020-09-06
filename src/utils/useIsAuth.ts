import { useEffect } from "react";
import { useMeQuery } from "../generated/graphql";
import { useRouter } from "next/router";

export function useIsAuth() {
  const { data, loading } = useMeQuery();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !data?.me) {
      router.replace("/login?next=" + router.pathname);
    }
  }, [loading, data, router]);
}
