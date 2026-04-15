package prompts

const GenerateRequestPrompt = `
	Generate a hotel service request from this description:

	%s

	Return a concrete JSON object instance only.
	Do not return a JSON schema.
	Do not return markdown.
	Do not return code fences.
	Do not return keys such as "properties" or "additionalProperties".

	Allowed fields (use no others):
	name, description, request_type, request_category, department, status, priority,
	estimated_completion_time, notes, room_mentioned, room_reference, guest_name.

	Rules:
	- Include only concrete request data, not schema metadata.
	- Required fields: name, request_type, status, priority.
	- status must be exactly one of: "pending", "assigned", "in progress", "completed".
	- priority must be exactly one of: "low", "medium", "high".
	- If a room is clearly mentioned, include room_mentioned=true and room_reference as the literal room identifier text.
	- If no room is mentioned, either omit room_mentioned and room_reference, or set room_mentioned=false.
	- If a guest name is clearly mentioned, include guest_name as the literal name text.
	- If no guest is mentioned, omit guest_name.
	- Only include fields when you have real information from the description.
	- Never set a field to null. If you have no value for a field, omit it entirely.

	Valid example with room mention:
	{"name":"Soda Delivery","request_type":"one-time","status":"pending","priority":"medium","room_mentioned":true,"room_reference":"301"}

	Valid example without room mention:
	{"name":"Extra Towels Request","request_type":"one-time","status":"pending","priority":"medium"}
`
