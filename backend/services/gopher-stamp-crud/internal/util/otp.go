package util

import (
	"crypto/sha256"
	"encoding/binary"
	"fmt"
	"time"
)

// GenerateOTP generates a 4-digit OTP based on the secret key and current time (1-minute window)
func GenerateOTP(secretKey string, t time.Time) string {
	// Round down to the nearest minute
	timestamp := t.Truncate(time.Minute).Unix()

	// Create a buffer for the timestamp
	buf := make([]byte, 8)
	binary.BigEndian.PutUint64(buf, uint64(timestamp))

	// Combine secret key and timestamp
	data := append([]byte(secretKey), buf...)

	// Hash the data
	hash := sha256.Sum256(data)

	// Take the first 4 bytes and convert to a number
	offset := hash[len(hash)-1] & 0x0f
	binaryCode := int(hash[offset]&0x7f)<<24 |
		int(hash[offset+1]&0xff)<<16 |
		int(hash[offset+2]&0xff)<<8 |
		int(hash[offset+3]&0xff)

	// Generate 4-digit code
	otp := binaryCode % 10000
	return fmt.Sprintf("%04d", otp)
}

// VerifyOTP verifies if the provided OTP is valid for the given secret key
// It checks the current time window and the previous one (to allow for slight delays)
func VerifyOTP(secretKey, inputOTP string) bool {
	now := time.Now()

	// Check current window
	if GenerateOTP(secretKey, now) == inputOTP {
		return true
	}

	// Check previous window (1 minute ago)
	if GenerateOTP(secretKey, now.Add(-1*time.Minute)) == inputOTP {
		return true
	}

	return false
}
