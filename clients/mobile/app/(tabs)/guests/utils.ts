import { Filter } from "@/components/ui/filters";

// this will get modified once the getFloors endpoint is completed:: PENDING
export const getFloorConfig = (
  floors: number[],
  changeFloor: (f: number) => void,
): Filter<number>[] => {
  const filterConfig = [
    {
      value: floors,
      onChange: changeFloor,
      placeholder: "Floor",
      options: [
        { label: "Floor 1", value: 1 },
        { label: "Floor 2", value: 2 },
        { label: "Floor 3", value: 3 },
        { label: "Floor 4", value: 4 },
        { label: "Floor 5", value: 5 },
        { label: "Floor 6", value: 6 },
        { label: "Floor 7", value: 7 },
        { label: "Floor 8", value: 8 },
        { label: "Floor 9", value: 9 },
      ],
    },
  ];
  return filterConfig;
};
