package gemini

type ParseRequestInput struct {
	Request string `json:"request"`
}

type ParseRequestOutput struct {
	Name                    string `json:"name"`
	Description             string `json:"description"`
	RoomID                  string `json:"room_id"`
	RequestCategory         string `json:"request_category"`
	RequestType             string `json:"request_type"`
	Department              string `json:"department"`
	Status                  string `json:"status"`
	Priority                string `json:"priority"`
	EstimatedCompletionTime int    `json:"estimated_completion_time"`
}
