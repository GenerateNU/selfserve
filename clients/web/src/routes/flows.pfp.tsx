import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

// Hardcoded user ID for testing - replace with actual user ID from your database
const TEST_USER_ID = 'd2cdfc34-f4e7-4e1b-bbd0-234fbd8feeaa'

// @ts-ignore - Environment variable injected by bundler
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080'

export const Route = createFileRoute('/flows/pfp')({ component: PfpFlow })

function PfpFlow() {
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch profile picture on component mount
  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/v1/users/${TEST_USER_ID}/profile-picture`
        )
        if (res.ok) {
          const data = await res.json()
          setProfilePicUrl(data.presigned_url)
        } else if (res.status === 404) {
          // No profile picture found, which is fine
          setProfilePicUrl(null)
        } else {
          console.error('Failed to fetch profile picture')
        }
      } catch (err) {
        console.error('Error fetching profile picture:', err)
      } finally {
        setIsInitialLoading(false)
      }
    }

    fetchProfilePicture()
  }, [])

  const getFileExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || 'jpg'
    return ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg'
  }

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file) {
      setStatus('Please select a file first')
      return
    }

    setIsLoading(true)
    setStatus('Getting upload URL...')

    try {
      // Step 1: Get presigned upload URL from backend
      const ext = getFileExtension(file.name)
      const uploadUrlRes = await fetch(
        `${API_BASE_URL}/api/v1/s3/upload-url/${TEST_USER_ID}?ext=${ext}`
      )
      if (!uploadUrlRes.ok) {
        throw new Error('Failed to get upload URL')
      }
      const { presigned_url, key } = await uploadUrlRes.json()

      // Step 2: Upload file directly to S3
      setStatus('Uploading to S3...')
      const uploadRes = await fetch(presigned_url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })
      if (!uploadRes.ok) {
        throw new Error('Failed to upload to S3')
      }

      // Step 3: Save the key to the user's profile
      setStatus('Saving to profile...')
      const saveRes = await fetch(
        `${API_BASE_URL}/api/v1/users/${TEST_USER_ID}/profile-picture`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key }),
        }
      )
      if (!saveRes.ok) {
        throw new Error('Failed to save profile picture')
      }

      // Step 4: Get a presigned URL to display the image
      setStatus('Fetching display URL...')
      const displayUrlRes = await fetch(
        `${API_BASE_URL}/api/v1/s3/presigned-get-url/${key}`
      )
      if (!displayUrlRes.ok) {
        throw new Error('Failed to get display URL')
      }
      const { presigned_url: displayUrl } = await displayUrlRes.json()

      setProfilePicUrl(displayUrl)
      setStatus('Upload complete!')
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = async () => {
    setIsLoading(true)
    setStatus('Removing profile picture...')

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/users/${TEST_USER_ID}/profile-picture`,
        { method: 'DELETE' }
      )
      if (!res.ok) {
        throw new Error('Failed to remove profile picture')
      }

      setProfilePicUrl(null)
      setStatus('Profile picture removed!')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      fileInputRef.current.click()
    }
  }

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '8px', fontSize: '24px', fontWeight: '600' }}>
        Profile Picture
      </h1>
      <p style={{ marginBottom: '32px', fontSize: '14px', color: '#666' }}>
        User ID: <code style={{ fontSize: '12px' }}>{TEST_USER_ID}</code>
      </p>

      {/* Current Profile Picture */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '500' }}>
          Current Picture
        </div>
        {isInitialLoading ? (
          <div
            style={{
              width: '200px',
              height: '200px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
              fontSize: '14px',
            }}
          >
            Loading...
          </div>
        ) : profilePicUrl ? (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img
              src={profilePicUrl}
              alt="Profile"
              style={{
                width: '200px',
                height: '200px',
                objectFit: 'cover',
                border: '1px solid #ddd',
                borderRadius: '4px',
                display: 'block',
              }}
            />
          </div>
        ) : (
          <div
            style={{
              width: '200px',
              height: '200px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
              fontSize: '14px',
            }}
          >
            No picture
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '500' }}>
          Actions
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleUpload()
              }
            }}
          />
          <button
            onClick={handleFileSelect}
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              border: '1px solid #333',
              backgroundColor: '#fff',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              borderRadius: '4px',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? 'Processing...' : 'Upload Picture'}
          </button>
          <button
            onClick={handleRemove}
            disabled={isLoading || !profilePicUrl}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              border: '1px solid #ccc',
              backgroundColor: '#fff',
              cursor: isLoading || !profilePicUrl ? 'not-allowed' : 'pointer',
              borderRadius: '4px',
              opacity: isLoading || !profilePicUrl ? 0.5 : 1,
            }}
          >
            Delete Picture
          </button>
        </div>
      </div>

      {/* Status */}
      {status && (
        <div
          style={{
            padding: '12px',
            fontSize: '14px',
            backgroundColor: status.startsWith('Error') ? '#fee' : '#f0f9ff',
            border: `1px solid ${status.startsWith('Error') ? '#fcc' : '#b3d9ff'}`,
            borderRadius: '4px',
            color: status.startsWith('Error') ? '#c00' : '#0066cc',
          }}
        >
          {status}
        </div>
      )}
    </div>
  )
}
