import { clsx } from 'clsx';
import { useState } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { Visibility } from './icons/visibility';
import { VisibilityOff } from './icons/visibility-off';
import { InputError } from './input-error';

interface InputProps {
  type?: 'default' | 'email' | 'password';
  placeholder?: string;
  errorMessage?: string;
  value?: string;
  maxLength?: number;
  onFocus?: () => void;
  onChange?: (val: string) => void;
  onEnter?: () => void;
  closeOnEnter?: boolean;
  formRegister?: UseFormRegisterReturn;
  className?: string;
}

export const Input: React.FC<InputProps> = (props) => {
  const [passwordHidden, setPasswordHidden] = useState(true);

  let inputType = undefined;
  if (props.type === 'password' && passwordHidden) {
    inputType = 'password';
  } else if (props.type === 'email') {
    inputType = 'email';
  }

  return (
    <div>
      <div className="relative flex flex-col">
        <input
          type={inputType}
          maxLength={props.maxLength}
          autoCapitalize="none"
          autoCorrect="none"
          placeholder={props.placeholder}
          className={clsx(props.className, 'rounded-sm border p-1')}
          onFocus={props.onFocus}
          value={props.value}
          onChange={(e) => props.onChange?.(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              props.onEnter?.();

              if (props.closeOnEnter) {
                e.currentTarget.blur();
              }
            }
          }}
          {...props.formRegister}
        />
        {props.type === 'password' ? (
          <button
            type="button"
            onClick={() => setPasswordHidden(!passwordHidden)}
            className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer text-neutral-600"
          >
            {passwordHidden ? <VisibilityOff /> : <Visibility />}
          </button>
        ) : null}
      </div>

      {props.errorMessage ? (
        <InputError>{props.errorMessage}</InputError>
      ) : null}
    </div>
  );
};
