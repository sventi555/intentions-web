import { toast } from 'sonner';

type NumericRange<
  N extends number,
  Result extends Array<unknown> = [],
> = Result['length'] extends N
  ? Result[number]
  : NumericRange<N, [...Result, Result['length']]>;

type FilterGreaterThan<Union, Threshold extends number> = Exclude<
  Union,
  NumericRange<Threshold>
>;

type Res = { status: number };
type ErrorStatuses<Statuses> = FilterGreaterThan<Statuses, 400>;
type ErrorMessages<R extends Res> = Record<ErrorStatuses<R['status']>, string>;
type SuccessRes<R extends Res> = Extract<
  R,
  { status: Exclude<R['status'], ErrorStatuses<R['status']>> }
>;

export const performMutation = async <
  R extends { status: number },
  E extends ErrorMessages<R>,
>({
  mutate,
  setLoading,
  errorMessages,
  onSuccess,
}: {
  mutate: () => Promise<R>;
  setLoading: (loading: boolean) => void;
  errorMessages: E;
  onSuccess: (res: SuccessRes<R>) => Promise<unknown>;
}) => {
  setLoading(true);
  mutate()
    .then((res) => {
      if (keyOf(res.status, errorMessages)) {
        toast.error(errorMessages[res.status]);
        return;
      }

      return onSuccess(res as SuccessRes<R>);
    })
    .catch(() => toast.error('Something went wrong, please try again.'))
    .finally(() => setLoading(false));
};

const keyOf = <T extends number>(s: number, o: Record<T, string>): s is T => {
  return s in o;
};
