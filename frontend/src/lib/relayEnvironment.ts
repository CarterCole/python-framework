import { Environment, Network, Observable, RecordSource, Store } from 'relay-runtime';
import type { FetchFunction, SubscribeFunction } from 'relay-runtime';
import { createClient } from 'graphql-ws';

const fetchFn: FetchFunction = async (request, variables) => {
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: request.text, variables }),
  });
  const json = await response.json();
  // Throw so a failed request rejects instead of reading as an empty result.
  if (json.errors?.length && !json.data) throw new Error(json.errors[0].message);
  return json;
};

let wsClient: ReturnType<typeof createClient> | null = null;

const getWsClient = () => {
  if (typeof window === 'undefined') return null;
  if (!wsClient) {
    wsClient = createClient({ url: `${window.location.origin.replace(/^http/, 'ws')}/graphql` });
  }
  return wsClient;
};

const subscribeFn: SubscribeFunction = (request, variables) => {
  const client = getWsClient();
  if (!client) {
    return Observable.create((sink) => {
      sink.complete();
    });
  }
  return Observable.create((sink) => {
    return client.subscribe(
      {
        operationName: request.name,
        query: request.text!,
        variables,
      },
      {
        // graphql-ws's ExecutionResult allows `data: null`; Relay's GraphQLResponse
        // doesn't, so normalize before handing the payload to Relay's sink.
        next: (value) => sink.next(value.data === null ? { ...value, data: undefined } : (value as any)),
        error: (err) => sink.error(err instanceof Error ? err : new Error(String(err))),
        complete: () => sink.complete(),
      },
    );
  });
};

export const environment = new Environment({
  network: Network.create(fetchFn, subscribeFn),
  store: new Store(new RecordSource()),
  isServer: typeof window === 'undefined',
});
