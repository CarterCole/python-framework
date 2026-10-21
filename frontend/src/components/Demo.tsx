import React, { Suspense, useMemo, useState } from 'react';
import { graphql, RelayEnvironmentProvider, useLazyLoadQuery, useMutation, useSubscription } from 'react-relay';
import type { RecordSourceSelectorProxy } from 'relay-runtime';
import { environment } from '../lib/relayEnvironment';
import type { DemoQuery } from '../__generated__/DemoQuery.graphql';
import type { DemoPostMessageMutation } from '../__generated__/DemoPostMessageMutation.graphql';
import type { DemoMessagePostedSubscription } from '../__generated__/DemoMessagePostedSubscription.graphql';

const messagesQuery = graphql`
  query DemoQuery {
    messages { id text }
  }
`;

const postMessageMutation = graphql`
  mutation DemoPostMessageMutation($text: String!) {
    postMessage(text: $text) { id text }
  }
`;

const messagePostedSubscription = graphql`
  subscription DemoMessagePostedSubscription {
    messagePosted { id text }
  }
`;

// The poster gets the new message from both the mutation and the
// subscription; append it to the root `messages` list once, whichever lands first.
const appendMessage = (field: string) => (store: RecordSourceSelectorProxy) => {
  const message = store.getRootField(field);
  if (!message) return;
  const root = store.getRoot();
  const messages = root.getLinkedRecords('messages') ?? [];
  if (messages.some((m) => m?.getDataID() === message.getDataID())) return;
  root.setLinkedRecords([...messages, message], 'messages');
};

function Messages() {
  const { messages } = useLazyLoadQuery<DemoQuery>(messagesQuery, {});
  const [commitPost, isPosting] = useMutation<DemoPostMessageMutation>(postMessageMutation);
  const [text, setText] = useState('');

  const subscriptionConfig = useMemo(
    () => ({ subscription: messagePostedSubscription, variables: {}, updater: appendMessage('messagePosted') }),
    [],
  );
  useSubscription<DemoMessagePostedSubscription>(subscriptionConfig);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    commitPost({
      variables: { text },
      updater: appendMessage('postMessage'),
      onCompleted: () => setText(''),
    });
  };

  return (
    <main>
      <ul>
        {messages.map((m) => (
          <li key={m.id}>{m.text}</li>
        ))}
      </ul>
      <form onSubmit={onSubmit}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Say something" />
        <button type="submit" disabled={isPosting}>
          Post
        </button>
      </form>
    </main>
  );
}

export default function Demo() {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback={<p>Loading…</p>}>
        <Messages />
      </Suspense>
    </RelayEnvironmentProvider>
  );
}
