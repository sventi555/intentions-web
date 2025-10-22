import { useState } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { Visibility } from './icons/visibility';
import { VisibilityOff } from './icons/visibility-off';

interface InputProps {
  type?: 'default' | 'password';
  placeholder?: string;
  errorMessage?: string;
  value?: string;
  onChange?: (val: string) => void;
  formRegister?: UseFormRegisterReturn;
}

export const Input: React.FC<InputProps> = (props) => {
  const [passwordHidden, setPasswordHidden] = useState(true);

  return (
    <div>
      <div className="relative flex flex-col">
        <input
          type={
            props.type === 'password' && passwordHidden ? 'password' : undefined
          }
          placeholder={props.placeholder}
          className="rounded-sm border p-1"
          value={props.value}
          onChange={(e) => props.onChange?.(e.target.value)}
          {...props.formRegister}
        />
        {props.type === 'password' ? (
          <button
            onClick={() => setPasswordHidden(!passwordHidden)}
            className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer text-neutral-600"
          >
            {passwordHidden ? <VisibilityOff /> : <Visibility />}
          </button>
        ) : null}
      </div>

      {props.errorMessage ? (
        <div className="text-sm text-red-400">{props.errorMessage}</div>
      ) : null}
    </div>
  );
};
