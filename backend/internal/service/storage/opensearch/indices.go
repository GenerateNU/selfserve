package opensearchstorage

// Index name constants and their mappings. Each entity gets a name constant
// and a mapping var here — both are used together in EnsureIndex calls.

const GuestsIndex = "guests"

// GuestsIndexMapping defines the guests index schema. Fields are denormalized from
// guests + guest_bookings + rooms so all filtering can happen in one query.
var GuestsIndexMapping = map[string]interface{}{
	"mappings": map[string]interface{}{
		"properties": map[string]interface{}{
			"id":       map[string]string{"type": "keyword"},
			"hotel_id": map[string]string{"type": "keyword"},
			"full_name": map[string]interface{}{
				"type": "text",
				"fields": map[string]interface{}{
					"keyword": map[string]string{"type": "keyword"},
				},
			},
			"first_name": map[string]interface{}{
				"type": "text",
				"fields": map[string]interface{}{
					"keyword": map[string]string{"type": "keyword"},
				},
			},
			"last_name": map[string]interface{}{
				"type": "text",
				"fields": map[string]interface{}{
					"keyword": map[string]string{"type": "keyword"},
				},
			},
			"preferred_name": map[string]interface{}{"type": "text"},
			"email":          map[string]interface{}{"type": "text"},
			"phone":          map[string]string{"type": "keyword"},
			"preferences":    map[string]interface{}{"type": "text"},
			"notes":          map[string]interface{}{"type": "text"},
			"floor":          map[string]string{"type": "integer"},
			"room_number":    map[string]string{"type": "integer"},
			"group_size":     map[string]string{"type": "integer"},
			"booking_status": map[string]string{"type": "keyword"},
			"arrival_date":   map[string]interface{}{"type": "date", "format": "strict_date_optional_time"},
			"departure_date": map[string]interface{}{"type": "date", "format": "strict_date_optional_time"},
		},
	},
}
