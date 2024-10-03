import {
  faFloppyDisk,
  faRectangleXmark,
  faRotateLeft,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import { atom, useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import PropTypes from 'prop-types';
import { Suspense, lazy, memo, useCallback, useEffect } from 'react';

import { TokenCount } from '@/app/components/TokenCount';

import { database } from '@/app/database/database.config';

export const systemMessageAtom = atomWithStorage(
  'systemMessage',
  'You are a helpful AI assistant.'
);

const LazyFontAwesomeIcon = lazy(() =>
  import('@fortawesome/react-fontawesome').then((module) => ({
    default: module.FontAwesomeIcon,
  }))
);

export const SystemMessage = memo(({ input, systemMessageRef }) => {
  const localSystemMessageAtom = atom('');
  const originalSystemMessageAtom = atom('');

  const [systemMessage, setSystemMessage] = useAtom(systemMessageAtom);
  const [localSystemMessage, setLocalSystemMessage] = useAtom(
    localSystemMessageAtom
  );
  const [originalSystemMessage, setOriginalSystemMessage] = useAtom(
    originalSystemMessageAtom
  );

  useEffect(() => {
    setOriginalSystemMessage(systemMessage);
    setLocalSystemMessage(systemMessage);
  }, [setLocalSystemMessage, setOriginalSystemMessage, systemMessage]);

  const cancelClickHandler = useCallback(() => {
    setSystemMessage(originalSystemMessage);
    const systemMessageMenu = document.querySelectorAll(
      'details.system-message-dropdown'
    );
    for (const menu of systemMessageMenu) {
      if (menu) {
        menu.removeAttribute('open');
      }
    }
  }, [originalSystemMessage, setSystemMessage]);

  const resetClickHandler = useCallback(() => {
    if (localSystemMessage !== originalSystemMessage) {
      if (confirm('Are you sure you want to reset your unsaved changes?')) {
        setSystemMessage(originalSystemMessage);
        setLocalSystemMessage(originalSystemMessage);
      }
    }
  }, [
    localSystemMessage,
    originalSystemMessage,
    setLocalSystemMessage,
    setSystemMessage,
  ]);

  const saveClickHandler = useCallback(async () => {
    if (localSystemMessage !== originalSystemMessage) {
      if (
        confirm(
          'Are you sure you want to change the system message?\n\nNOTE: This will also clear your chat history and reload the app.'
        )
      ) {
        setLocalSystemMessage(localSystemMessage);
        setSystemMessage(localSystemMessage);
        try {
          await database.messages.clear();
          window.location.reload();
        } catch (error) {
          console.error(error);
        }
      }
    }
  }, [
    localSystemMessage,
    originalSystemMessage,
    setLocalSystemMessage,
    setSystemMessage,
  ]);

  const handleSystemMessageChange = (e) => {
    setLocalSystemMessage(e.target.value);
  };

  return (
    <>
      <TokenCount
        input={input}
        systemMessage={localSystemMessage}
        display={'systemMessage'}
      />
      <textarea
        className="h-48 m-2 whitespace-pre-line w-52 lg:w-96"
        ref={systemMessageRef}
        onChange={handleSystemMessageChange}
        value={localSystemMessage}
      />
      <div className="join">
        <button
          className="btn btn-sm lg:btn-md join-item btn-info"
          type="button"
          onClick={cancelClickHandler}
        >
          <Suspense fallback={<span>Loading...</span>}>
            <LazyFontAwesomeIcon icon={faRectangleXmark} />
          </Suspense>
          <span className="hidden lg:flex">Close</span>
        </button>
        <button
          className={clsx('btn btn-sm lg:btn-md join-item btn-error', {
            'btn-disabled':
              localSystemMessage?.trim() === originalSystemMessage?.trim(),
          })}
          type="button"
          onClick={resetClickHandler}
        >
          <FontAwesomeIcon icon={faRotateLeft} />
          <span className="hidden lg:flex">Reset</span>
        </button>
        <button
          className={clsx('btn btn-sm lg:btn-md join-item btn-success', {
            'btn-disabled':
              localSystemMessage?.trim() === originalSystemMessage?.trim(),
          })}
          type="button"
          disabled={
            localSystemMessage?.trim() === originalSystemMessage?.trim()
          }
          onClick={saveClickHandler}
        >
          <FontAwesomeIcon icon={faFloppyDisk} />
          <span className="hidden lg:flex">Save</span>
        </button>
      </div>
    </>
  );
});

SystemMessage.displayName = 'SystemMessage';
SystemMessage.propTypes = {
  input: PropTypes.string,
  systemMessageRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.object }),
  ]),
};

export default SystemMessage;
