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
  const setItemImpl = (k: string, v: string) => { store[k] = v; };
  const setItemSpy = vi.fn(setItemImpl);
    const mock: Partial<Storage> = {
      getItem: (k: string) => store[k] ?? null,
      setItem: setItemSpy as unknown as (k: string, v: string) => void,
      removeItem: (k: string) => { delete store[k]; },
      clear: () => { store = {}; },
    };
  global.localStorage = mock as Storage;
    // expose spy for assertions
  // expose spy for assertions
  // attach spy for assertions on global (test-only helper)
  // attach spy for assertions on global (test-only helper)
  (global as unknown as { __setItemSpy?: typeof setItemSpy }).__setItemSpy = setItemSpy;
  });

  afterEach(() => {
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
  const spy = (global as unknown as { __setItemSpy?: ReturnType<typeof vi.fn> }).__setItemSpy as ReturnType<typeof vi.fn> | undefined;
  expect(spy).toBeDefined();
    // find any call where payload includes our new input
    const calls = (spy!.mock.calls as [string, string][]).map(([key, val]) => ({ key, value: JSON.parse(val) }));
    const match = calls.find(c => c.key === 'exploramodelo_state' && c.value.inputText === 'hola mundo' && c.value.currentStep === 1);
    expect(match).toBeDefined();
  });
});
