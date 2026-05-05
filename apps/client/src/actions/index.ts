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

type ErrorStatus<R extends Res> = FilterGreaterThan<R['status'], 400>;

type SuccessResponse<R extends Res> = R extends {
  status: infer S;
}
  ? S extends ErrorStatus<R>
    ? never
    : R
  : never;

type PerformMutationArgs<Res extends { status: number }> = {
  mutate: () => Promise<Res>;
  setLoading: (loading: boolean) => void;
  errorMessages: Record<ErrorStatus<Res>, string>;
  onSuccess: (res: SuccessResponse<Res>) => Promise<unknown>;
};

export const performMutation = async <Res extends { status: number }>({
  mutate,
  setLoading,
  errorMessages,
  onSuccess,
}: PerformMutationArgs<Res>) => {
  setLoading(true);
  mutate()
    .then((res) => {
      if (keyOf(res.status, errorMessages)) {
        toast.error(errorMessages[res.status]);
        return;
      }

      return onSuccess(res as SuccessResponse<Res>);
    })
    .catch(() => toast.error('Something went wrong, please try again.'))
    .finally(() => setLoading(false));
};

const keyOf = <T extends number>(s: number, o: Record<T, string>): s is T => {
  return s in o;
};
