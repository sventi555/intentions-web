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

type ErrorStatuses<Statuses> = FilterGreaterThan<Statuses, 400>;

type PerformMutationArgs<Res extends { status: number }> = {
  mutate: () => Promise<Res>;
  setLoading: (loading: boolean) => void;
  errorMessages: Record<ErrorStatuses<Res['status']>, string>;
  onSuccess: () => Promise<unknown>;
};

export const performMutation = async <Res extends { status: number }>({
  mutate,
  setLoading,
  errorMessages,
  onSuccess,
}: PerformMutationArgs<Res>) => {
  setLoading(true);
  mutate()
    .then(({ status }) => {
      if (keyOf(status, errorMessages)) {
        toast.error(errorMessages[status]);
        return;
      }

      return onSuccess();
    })
    .catch(() => toast.error('Something went wrong, please try again.'))
    .finally(() => setLoading(false));
};

const keyOf = <T extends number>(s: number, o: Record<T, string>): s is T => {
  return s in o;
};
