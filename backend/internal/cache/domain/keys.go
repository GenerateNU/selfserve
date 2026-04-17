package domain

const keyPrefix = "selfserve:v1"

func userKey(id string) string {
	return keyPrefix + ":users:" + id
}
