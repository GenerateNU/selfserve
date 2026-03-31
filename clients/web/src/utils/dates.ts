export function formatDate(iso: string): string {
  const datePart = iso.includes("T") ? iso.split("T")[0] : iso;
  const [year, month, day] = datePart.split("-");

  if (!year || !month || !day) {
    return iso;
  }

  return `${month}/${day}/${year}`;
}
