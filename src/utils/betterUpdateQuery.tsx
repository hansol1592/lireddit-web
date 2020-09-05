import { QueryInput, Cache } from "@urql/exchange-graphcache";

/**
 * @summary
 Result, Query 는 제네릭
 타입을 알려줘서 편하긴 한데 헷갈리면 그냥 지우고
 fn 의 타입도 any 로 잡아서 작업하는게 더 가독성은 좋은 듯
 @param queryInput Query 의 Document 를 넣어주면 됨
 */
export function betterUpdateQuery<Result, Query>(
  cache: Cache,
  queryInput: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(
    queryInput,
    (data) => fn(result, data as any) as any
  );
}
