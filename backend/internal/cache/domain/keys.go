package domain

const keyPrefix = "selfserve:v1"

func userKey(id string) string {
	return keyPrefix + ":users:" + id
}

func hotelKey(id string) string {
	return keyPrefix + ":hotels:" + id
}

func guestKey(id string) string {
	return keyPrefix + ":guests:" + id
}

func guestStayHistoryKey(id string) string {
	return keyPrefix + ":guests:" + id + ":stay_history"
}

func guestBookingGroupSizesKey(hotelID string) string {
	return keyPrefix + ":hotels:" + hotelID + ":guest_booking_group_sizes"
}
