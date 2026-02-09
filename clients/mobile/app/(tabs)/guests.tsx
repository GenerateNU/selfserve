
import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Header } from '@/components/ui/header';
import { SearchBar } from '@/components/ui/search-bar';
import { Filters } from '@/components/ui/filters';
import { GuestCard } from '@/components/ui/guest-card';

const guestData = [
  {
    id: 1,
    name: 'Manuel',
    floor: 1,
    room: 'room 1',
    group: 1
  },
  {
    id: 2,
    name: 'Manuel2',
    floor: 2,
    room: 'room 2',
    group: 2
  },
  {
    id: 3,
    name: 'Manuel3',
    floor: 3,
    room: 'room 3',
    group: 3
  },
];

export default function GuestsList() {
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState<number | null>(null);
  const [floor, setFloor] = useState<number | null>(null);

  const handleGuestPress = (guestId: number) => {
    Alert.alert(
    'Guest Selected',
    `You selected guest ID: ${guestId}`,
    [{ text: 'OK' }]
    // this is provisional, it will change when I finish the guest profile page
    );
  };

  const filterConfig = [
    {
      value: group,
      onChange: setGroup,
      placeholder: 'Group',
      emptyValue: null,
      options: [
        { label: 'Group 1', value: 1 },
        { label: 'Group 2', value: 2 },
        { label: 'Group 3', value: 3 },
      ]
    },
    {
      value: floor,
      onChange: setFloor,
      placeholder: 'Floor',
      emptyValue: null,
      options: [
        { label: 'Floor 1', value: 1 },
        { label: 'Floor 2', value: 2 },
        { label: 'Floor 3', value: 3 },
      ]
    }
  ];

  const filteredGuests = guestData.filter((guest) => {
    const matchesSearch = guest.name.toLowerCase().includes(search.toLowerCase());
    const matchesGroup = group === null || guest.group === group;
    const matchesFloor = floor === null || guest.floor === floor;

    return matchesSearch && matchesGroup && matchesFloor;
  });

  return (
    <View className="flex-1 bg-white">
      <Header title="Guests" />
      
      <ScrollView className="flex-1 px-[4vw] py-[2vh]">
        <SearchBar 
          value={search}
          onChangeText={setSearch}
        />
        
        <Filters
          filters={filterConfig}
          className="mt-[2vh]"
        />

        <View className="mt-[2vh] gap-[1vh]">
          {filteredGuests.map((guest) => (
            <GuestCard
              key={guest.id}
              name={guest.name}
              floor={guest.floor}
              room={guest.room}
              group={guest.group}
              onPress={() => handleGuestPress(guest.id)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}