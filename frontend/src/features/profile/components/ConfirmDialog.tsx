import {Dialog, DialogBody} from '@ui/pixelact';
import {useRef} from 'react';
import {FocusTrap} from 'focus-trap-react';
import {useModal} from '@/hooks/useModal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDarkMode?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'CONFIRM',
  cancelText = 'CANCEL',
  isDarkMode = false,
}: ConfirmDialogProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Use combined modal hook for focus management and escape key handling
  useModal(isOpen, onClose);

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <FocusTrap
        active={isOpen}
        focusTrapOptions={{
          allowOutsideClick: true,
          escapeDeactivates: false, // We handle Escape in our own handler
          initialFocus: () => confirmButtonRef.current || undefined,
          returnFocusOnDeactivate: false, // We handle this manually for better control
        }}
      >
        <DialogBody>
          <div
            className="pixel-font p-4 sm:p-6 max-w-md mx-auto"
            style={{
              backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f1e8',
              border: `4px solid ${isDarkMode ? '#333333' : 'black'}`,
              boxShadow: isDarkMode
                ? '8px 8px 0px rgba(51,51,51,1)'
                : '8px 8px 0px rgba(0,0,0,1)',
            }}
          >
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
              {title}
            </h2>
            <p
              className="mb-4 sm:mb-6 text-sm sm:text-base"
              style={{color: isDarkMode ? '#e5e5e5' : '#000'}}
            >
              {message}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 font-bold border-4 transition-all text-sm sm:text-base"
                style={{
                  borderColor: isDarkMode ? '#333333' : 'black',
                  backgroundColor: isDarkMode ? '#2a2a2a' : '#d4d4d4',
                  color: isDarkMode ? '#e5e5e5' : '#000',
                  boxShadow: isDarkMode
                    ? '4px 4px 0px rgba(51,51,51,1)'
                    : '4px 4px 0px rgba(0,0,0,1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translate(-2px, -2px)';
                  e.currentTarget.style.boxShadow = isDarkMode
                    ? '6px 6px 0px rgba(51,51,51,1)'
                    : '6px 6px 0px rgba(0,0,0,1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate(0, 0)';
                  e.currentTarget.style.boxShadow = isDarkMode
                    ? '4px 4px 0px rgba(51,51,51,1)'
                    : '4px 4px 0px rgba(0,0,0,1)';
                }}
              >
                {cancelText}
              </button>

              <button
                ref={confirmButtonRef}
                onClick={onConfirm}
                className="flex-1 px-4 py-2 font-bold border-4 transition-all text-sm sm:text-base"
                style={{
                  borderColor: isDarkMode ? '#333333' : 'black',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  boxShadow: isDarkMode
                    ? '4px 4px 0px rgba(51,51,51,1)'
                    : '4px 4px 0px rgba(0,0,0,1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translate(-2px, -2px)';
                  e.currentTarget.style.boxShadow = isDarkMode
                    ? '6px 6px 0px rgba(51,51,51,1)'
                    : '6px 6px 0px rgba(0,0,0,1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate(0, 0)';
                  e.currentTarget.style.boxShadow = isDarkMode
                    ? '4px 4px 0px rgba(51,51,51,1)'
                    : '4px 4px 0px rgba(0,0,0,1)';
                }}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </DialogBody>
      </FocusTrap>
    </Dialog>
  );
}
