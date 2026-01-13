import { UseFormRegisterReturn } from 'react-hook-form';

import { InputError } from '@/components/atoms/input-error';

interface TextAreaProps {
  placeholder?: string;
  errorMessage?: string;
  value?: string;
  onChange?: (val: string) => void;
  formRegister?: UseFormRegisterReturn;
}

export const TextArea: React.FC<TextAreaProps> = (props) => {
  return (
    <div className="flex flex-col">
      <textarea
        placeholder={props.placeholder}
        className="h-24 rounded-sm border border-neutral-300 p-1"
        value={props.value}
        onChange={(e) => props.onChange?.(e.target.value)}
        {...props.formRegister}
      />

      {props.errorMessage ? (
        <InputError>{props.errorMessage}</InputError>
      ) : null}
    </div>
  );
};
