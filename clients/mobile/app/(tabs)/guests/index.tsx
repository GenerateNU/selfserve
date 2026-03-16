
import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Header } from '@/components/ui/header';
import { SearchBar } from '@/components/ui/search-bar';
import { Filters } from '@/components/ui/filters';
import { GuestCard } from '@/components/ui/guest-card';
import { router } from 'expo-router';
import { useGetApiV1Guests } from '@shared/api/generated/endpoints/guests/guests';

export default function GuestsList() {
  const [search, setSearch] = useState('');
  const [floors, setFloor] = useState<number[] | null>(null);

  const onFloorChange = (floor: number) => {
    if (floors?.includes(floor)) {
    setFloor(floors.filter(elem => elem !== floor));
    } else {
        setFloor([...(floors ?? []), floor]);
    }
  }

  const handleGuestPress = (guestId: string) => {
     router.push(`/guests/${guestId}`);
  };

  const filterConfig = [
    {
      value: floors,
      onChange: onFloorChange,
      placeholder: 'Floor',
      emptyValue: null,
      options: [
        { label: 'Floor 1', value: 1 },
        { label: 'Floor 2', value: 2 },
        { label: 'Floor 3', value: 3 },
        { label: 'Floor 4', value: 4 },
        { label: 'Floor 5', value: 5 },
        { label: 'Floor 6', value: 6 },
        { label: 'Floor 7', value: 7 },
        { label: 'Floor 8', value: 8 },
        { label: 'Floor 9', value: 9 },
      ]
    }
  ];

  const { data, isLoading, isError, error } = useGetApiV1Guests({
    "floors[]": floors ?? undefined
  })

  console.log("data", data)
  console.log("isLoading", isLoading)
  console.log("isError", isError)
  console.log("error", error)


  return (
    <View className="flex-1 bg-white">
      <Header title="Guests" />

      <ScrollView className="flex-1 px-[4vw] py-[2vh]">
        <SearchBar value={search} onChangeText={setSearch} />

        <Filters filters={filterConfig} className="mt-[2vh]" />

        <View className="mt-[2vh] gap-[1vh]">
          {data?.map((guest) => (
            <GuestCard
              key={guest.id}
              firstName={guest.first_name}
              lastName={guest.last_name}
              floor={guest.floor}
              room={guest.room_number}
              onPress={() => handleGuestPress(guest.id)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
