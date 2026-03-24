export const useClerkErrorHandler = (setError: (msg: string) => void) => {
  const run = async (action: () => Promise<void>) => {
    setError("");
    try {
      await action();
    } catch (err: any) {
      setError(err.errors?.[0]?.message);
    }
  };

  return run;
};
