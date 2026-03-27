# SelfServe

## Patterns

### Optimistic Updates (TanStack Query)

Use this pattern for mutations that should update the UI immediately before the server responds.

```ts
const { mutate } = useMutation({
  mutationFn: (value: string) =>
    request({ url: `/resource/${id}`, method: "PUT", data: { field: value } }),
  onMutate: async (value) => {
    // Cancel any in-flight refetches to avoid overwriting optimistic update
    await queryClient.cancelQueries({ queryKey: ["resource", id] });
    // Snapshot previous value for rollback
    const previous = queryClient.getQueryData<ResourceType>(["resource", id]);
    // Optimistically update the cache
    queryClient.setQueryData<ResourceType>(["resource", id], (old) => ({
      ...old,
      field: value,
    }));
    return { previous };
  },
  onError: (_err, _vars, context) => {
    // Roll back to snapshot on failure
    queryClient.setQueryData(["resource", id], context?.previous);
  },
  onSettled: () => {
    // Always resync with server after mutation
    queryClient.invalidateQueries({ queryKey: ["resource", id] });
  },
});
```
