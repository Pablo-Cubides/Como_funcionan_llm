import React from 'react';
import { render, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { ProcessProvider, useProcess } from '../ProcessContext';

function TestComponent() {
  const { state, dispatch } = useProcess();
  return (
    <div>
      <button onClick={() => dispatch({ type: 'START_PROCESS', payload: { text: 'hola mundo' } })}>start</button>
      <div data-testid="step">{state.currentStep}</div>
    </div>
  );
}

describe('ProcessContext persistence', () => {
  const originalLS = global.localStorage;

  beforeEach(() => {
    // mock localStorage with spies
    let store: Record<string, string> = {};
    const setItemSpy = vi.fn((k: string, v: string) => { store[k] = v; });
    const mock = {
      getItem: (k: string) => store[k] ?? null,
      setItem: setItemSpy,
      removeItem: (k: string) => { delete store[k]; },
      clear: () => { store = {}; },
    } as any;
    // @ts-ignore
    global.localStorage = mock;
    // expose spy for assertions
    // @ts-ignore
    global.__setItemSpy = setItemSpy;
  });

  afterEach(() => {
    // @ts-ignore
    global.localStorage = originalLS;
  });

  it('persists state after starting process', async () => {
    const { getByText } = render(
      <ProcessProvider>
        <TestComponent />
      </ProcessProvider>
    );

    await act(async () => {
      fireEvent.click(getByText('start'));
      // allow React to process state update
      await Promise.resolve();
    });

    // wait for debounce to flush to localStorage (real timers)
    await new Promise((res) => setTimeout(res, 350));

  // assert localStorage.setItem was called with expected payload
  // @ts-ignore
  const spy = global.__setItemSpy as ReturnType<typeof vi.fn>;
  expect(spy).toHaveBeenCalled();
    // find any call where payload includes our new input
    const calls = spy.mock.calls.map((c: any[]) => ({ key: c[0], value: JSON.parse(c[1]) }));
    const match = calls.find(c => c.key === 'exploramodelo_state' && c.value.inputText === 'hola mundo' && c.value.currentStep === 1);
    expect(match).toBeDefined();
  });
});
