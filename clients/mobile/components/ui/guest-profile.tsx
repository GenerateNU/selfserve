import { View, Text, Pressable } from "react-native";
import { Box } from "./box";
import { ChevronLeft, User } from "lucide-react-native";
import { Collapsible } from "./collapsible";
import { router } from "expo-router";

interface GuestProfileProps {
    name: string, 
    pronouns: string 
    dateOfBirth: Date, 
    room: number,
    groupSize: number,
    arrival: Date,
    departure: Date,
    notes: string,
    preferences: string,
    needs: string,
    previousStays: Stay[],
}

type Stay = {
    notes: string, 
    arrival: Date,
    departure: Date,
}


export default function GuestProfile(props : GuestProfileProps) {
    return (
        <Box>
            <HeaderWithBackArrow />
            <Box>
                <GuestDescription {...props} />
                <GuestInfoCollapsibles {...props} />
            </Box>

        </Box>
    );
}

function HeaderWithBackArrow() {
    return (
        <Box className="flex-row items-center px-[4vw] py-[3vh] border-b border-gray-200">
            <Pressable onPress={() => router.back()}>
                <ChevronLeft className="w-[6vw] h-[6vw]" color="#000" />
            </Pressable>
            <Text className="flex-1 text-center text-[5vw] font-semibold text-gray-900">
                Guest Profile
            </Text>
            
            <View className="w-[6vw]" />
        </Box>

    );
}

function GuestDescription(props : GuestProfileProps) {
    return (
        <Box className="p-[4vw] border-b border-gray-200">
            <View className="flex-row items-center mb-[3vh]">
                <View 
                className="w-[15vw] h-[15vw] rounded-full border-2 border-gray-400
                items-center justify-center mr-[3vw]">

                    <User className="w-[10vw] h-[10vw]" color="#374151" />
                </View>
                <View>
                    <Text className="text-[5vw] font-semibold text-gray-900">{props.name}</Text>
                    <Text className="text-[3.5vw] text-gray-600">{props. pronouns}</Text>
                </View>
            </View>

            <View className="gap-[2vh]">
                {GUEST_PROFILE_CONFIG.infoFields.map((field, index) => (
                    <InfoRow key={index} label={field.label} value={field.format(props)} />
                ))}
            </View>
        </Box>
    );
}


function InfoRow({ label, value }: { label: string; value: unknown }) {
    return (
        <View className="flex-row">
            <Text className="text-[3.5vw] text-gray-400 w-[35vw]">{label}</Text>
            <Text className="text-[3.5vw] text-gray-900 flex-1">{String(value)}</Text>
        </View>
    );
}



function GuestInfoCollapsibles(props : GuestProfileProps) {
    return (
        <Box className="p-[4vw] gap-[2vh]">
            {GUEST_PROFILE_CONFIG.collapsibles.map((item, index) => (
                <Collapsible key={index} title={item.title}>
                    <Text className="text-[3.5vw] text-gray-900">{item.format(props)}</Text>
                </Collapsible>
            ))}

            <Collapsible title="Previous Stays">
                {props.previousStays.length === 0 ? (
                    <Text className="text-[3.5vw] text-gray-400">No previous stays</Text>
                ) : (
                    <View className="gap-[1vh]">
                        {props.previousStays.map((stay, index) => (
                            <View key={index} className="border-b border-gray-200 pb-[1vh]">
                                <Text className="text-[3.5vw] text-gray-900">{stay.notes}</Text>
                                <Text className="text-[3vw] text-gray-600">
                                    {stay.arrival.toLocaleDateString()}
                                     - {stay.departure.toLocaleDateString()}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </Collapsible>
        </Box>
    );
}

// to provide a label and formatting of the data for each piece of data concerning the guest
const GUEST_PROFILE_CONFIG = {
    infoFields: [
        { 
            key: 'governmentName', 
            label: 'Government Name', 
            format: (props: GuestProfileProps) => props.name 
        },
        { 
            key: 'dateOfBirth', 
            label: 'Date of Birth', 
            format: (props: GuestProfileProps) => props.dateOfBirth.toLocaleDateString() 
        },
        { 
            key: 'room', 
            label: 'Room', 
            format: (props: GuestProfileProps) => props.room 
        },
        { 
            key: 'groupSize', 
            label: 'Group Size', 
            format: (props: GuestProfileProps) => props.groupSize.toString() 
        },
        { 
            key: 'arrival', 
            label: 'Arrival', 
            format: (props: GuestProfileProps) => 
                `${props.arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ${props.arrival.toLocaleDateString()}` 
        },
        { 
            key: 'departure', 
            label: 'Departure', 
            format: (props: GuestProfileProps) => 
                `${props.departure.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ${props.departure.toLocaleDateString()}` 
        },
    ],
    collapsibles: [
        { 
            key: 'notes', 
            title: 'Notes', 
            format: (props: GuestProfileProps) => props.notes 
        },
        { 
            key: 'preferences', 
            title: 'Housekeeping Preferences', 
            format: (props: GuestProfileProps) => props.preferences 
        },
        { 
            key: 'needs', 
            title: 'Special Needs', 
            format: (props: GuestProfileProps) => props.needs 
        },
    ],
};

