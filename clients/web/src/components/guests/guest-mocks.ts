export type GuestListItem = {
  id: string
  governmentName: string
  preferredName: string
  groupSize: number
  floor: number
  room: string
}

export type PreviousStay = {
  id: string
  startDate: string
  endDate: string
  room: string
  groupSize: number
}

export type GuestProfile = {
  id: string
  governmentName: string
  preferredName: string
  pronouns: string
  dateOfBirth: string
  room: string
  groupSize: number
  arrivalTime: string
  arrivalDate: string
  departureTime: string
  departureDate: string
  notes: string
  specialNeeds: {
    dietaryRestrictions: string
    accessibilityNeeds: string
    sensorySensitivities: string
    medicalConditions: string
  }
  previousStays: Array<PreviousStay>
  housekeeping: {
    frequency: string
    doNotDisturb: string
  }
}

export const guestListItems: Array<GuestListItem> = [
  {
    id: 'monkey-d-luffy',
    governmentName: 'Monkey D. Luffy',
    preferredName: 'Luffy',
    groupSize: 5,
    floor: 3,
    room: 'Suite 300',
  },
  {
    id: 'roronoa-zoro',
    governmentName: 'Roronoa Zoro',
    preferredName: 'Zoro',
    groupSize: 4,
    floor: 4,
    room: 'Suite 401',
  },
  {
    id: 'nami',
    governmentName: 'Nami',
    preferredName: 'Nami',
    groupSize: 2,
    floor: 2,
    room: 'Suite 203',
  },
  {
    id: 'nico-robin',
    governmentName: 'Nico Robin',
    preferredName: 'Robin',
    groupSize: 3,
    floor: 5,
    room: 'Suite 502',
  },
  {
    id: 'usopp',
    governmentName: 'Usopp',
    preferredName: 'Usopp',
    groupSize: 6,
    floor: 3,
    room: 'Suite 318',
  },
  {
    id: 'sanji',
    governmentName: 'Vinsmoke Sanji',
    preferredName: 'Sanji',
    groupSize: 1,
    floor: 1,
    room: 'Suite 102',
  },
]

export const guestProfilesById: Record<string, GuestProfile | undefined> = {
  'monkey-d-luffy': {
    id: 'monkey-d-luffy',
    governmentName: 'Monkey D. Luffy',
    preferredName: 'Luffy',
    pronouns: 'he/him',
    dateOfBirth: '03/21/2005',
    room: 'Suite 300',
    groupSize: 5,
    arrivalTime: '11:00 AM',
    arrivalDate: '01/25/2026',
    departureTime: '11:00 AM',
    departureDate: '02/04/2026',
    notes:
      '"Wealth, fame, power...  Gold Roger, the King of the Pirates, obtained this and everything else the world had to offer and his dying words drove countless souls to the seas.""You want my treasure?  You can have it!  I left everything I gathered together in one place!  Now you just have to find it!""These words lured men to the Grand Line.  In pursuit of dreams greather than theyve ever dared to imagine!  This is the time known as the Great Pirate Era!"',
    specialNeeds: {
      dietaryRestrictions: '',
      accessibilityNeeds: '',
      sensorySensitivities: '',
      medicalConditions: '',
    },
    previousStays: [
      {
        id: 'stay-1',
        startDate: '05/12/2024',
        endDate: '05/20/2024',
        room: 'Suite 401',
        groupSize: 5,
      },
      {
        id: 'stay-2',
        startDate: '12/04/2023',
        endDate: '12/11/2023',
        room: 'Suite 318',
        groupSize: 4,
      },
    ],
    housekeeping: {
      frequency: 'Daily',
      doNotDisturb: '6:00 PM - 10:00 AM',
    },
  },
}
