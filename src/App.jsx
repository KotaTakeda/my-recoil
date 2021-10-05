import React from 'react';
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
  useRecoilTransactionObserver_UNSTABLE,
} from 'recoil';

export default function App() {
  return (
    <RecoilRoot>
      {/* Debug用 */}
      <DebugObserver />
      <SetSameTextState />
      <CharacterCounter />
    </RecoilRoot>
  );
}

const textState = atom({
  key: 'textState',
  default: 'text in App',
});

function CharacterCounter() {
  return (
    <div>
      <TextInput />
      <CharacterCount />
    </div>
  );
}

function DebugObserver() {
  // 変更された"atom"を出力
  useRecoilTransactionObserver_UNSTABLE(({ snapshot }) => {
    console.debug('The following atoms were modified:');
    for (const node of snapshot.getNodes_UNSTABLE({isModified: true})) {
      console.debug(node.key, snapshot.getLoadable(node));
    }
  });
  return null;
}

function SetSameTextState() {
  const [text, setText] = useRecoilState(textState);
  function onClick() {
    setText(text);
  }
  return <button onClick={onClick}>Set same textState</button>
}

function TextInput() {
  const [text, setText] = useRecoilState(textState);

  const onChange = (event) => {
    setText(event.target.value);
  };

  return (
    <div>
      <input type="text" value={text} onChange={onChange} />
      <br />
      Echo: {text}
    </div>
  );
}

const charCountState = selector({
  key: 'charCountState',
  get: ({get}) => {
    const text = get(textState);

    return text.length;
  },
});

function CharacterCount() {
  const count = useRecoilValue(charCountState);

  return <>Character Count: {count}</>;
}