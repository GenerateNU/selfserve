package prompts

import "fmt"

// GenerateRequestPrompt builds the LLM prompt for request generation.
// departments is the list of valid department names for the hotel; pass nil or
// empty to omit the department constraint.
func GenerateRequestPrompt(rawText string, departments []string) string {
	departmentRule := "- If a department is clearly relevant, include it as the department field."
	if len(departments) > 0 {
		list := ""
		for i, d := range departments {
			if i > 0 {
				list += ", "
			}
			list += fmt.Sprintf("%q", d)
		}
		departmentRule = fmt.Sprintf(
			"- If a department is clearly relevant, set department to one of the following exact names: %s. If none fit, omit the field.",
			list,
		)
	}

	return fmt.Sprintf(`
	Generate a hotel service request from this description:

	%s

	Return a concrete JSON object instance only.
	Do not return a JSON schema.
	Do not return markdown.
	Do not return code fences.
	Do not return keys such as "properties" or "additionalProperties".

	Allowed fields (use no others):
	name, description, request_type, request_category, department, status, priority,
	estimated_completion_time, notes, room_mentioned, room_reference, guest_name, user_name.

	Rules:
	- Include only concrete request data, not schema metadata.
	- Required fields: name, request_type, status, priority.
	- status must be exactly one of: "pending", "assigned", "in progress", "completed".
	- priority must be exactly one of: "low", "medium", "high".
	- If a room is clearly mentioned, include room_mentioned=true and room_reference as the literal room identifier text.
	- If no room is mentioned, either omit room_mentioned and room_reference, or set room_mentioned=false.
	- If a guest name is clearly mentioned, include guest_name as the literal name text.
	- If no guest is mentioned, omit guest_name.
	- If a staff member or employee name is clearly mentioned as the person to assign the task to, include user_name as the literal name text.
	- If no staff member is mentioned, omit user_name.
	- %s
	- Only include fields when you have real information from the description.
	- Never set a field to null. If you have no value for a field, omit it entirely.

	Valid example with room mention:
	{"name":"Soda Delivery","request_type":"one-time","status":"pending","priority":"medium","room_mentioned":true,"room_reference":"301"}

	Valid example with room and guest mention:
	{"name":"Extra Towels Request","request_type":"one-time","status":"pending","priority":"medium","room_mentioned":true,"room_reference":"204","guest_name":"Maria Lopez"}

	Valid example with staff member mention:
	{"name":"AC Repair","request_type":"one-time","status":"pending","priority":"high","room_mentioned":true,"room_reference":"512","user_name":"John Smith"}

	Valid example without room mention:
	{"name":"Extra Towels Request","request_type":"one-time","status":"pending","priority":"medium"}
`, rawText, departmentRule)
}
