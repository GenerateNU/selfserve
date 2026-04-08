package models

// CreateUserOrgMembershipWebhook is the payload for Clerk's organizationMembership.created event.
// Clerk fires this when a user accepts an invitation to join an organization (hotel).
type CreateUserOrgMembershipWebhook struct {
	Data OrgMembershipData `json:"data"`
}

type OrgMembershipData struct {
	Organization   ClerkOrganization     `json:"organization"`
	PublicUserData OrgMembershipUserData `json:"public_user_data"`
}

type ClerkOrganization struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type CreateOrgWebhook struct {
	Data ClerkOrganization `json:"data"`
}

// OrgMembershipUserData is the limited user snapshot Clerk includes in org membership events.
// Note: the user ID field is "user_id" here, unlike ClerkUser which uses "id".
type OrgMembershipUserData struct {
	UserID    string  `json:"user_id"`
	FirstName string  `json:"first_name"`
	LastName  string  `json:"last_name"`
	ImageUrl  *string `json:"image_url"`
	HasImage  bool    `json:"has_image"`
}
