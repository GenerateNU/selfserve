import { createFileRoute } from '@tanstack/react-router'
import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react'
import { useRef } from 'react'

import { useProfilePicture } from '@/hooks/use-profile-picture'

/** Clerk user id from local seed (`backend/supabase/seed.sql` dev user). */
const TEST_USER_ID = 'user_3BgSkSK6KDYGD1VJRZvyO4MVF7L'

export const Route = createFileRoute('/flows/pfp')({ component: PfpFlowPage })

function PfpFlowPage() {
  return (
    <>
      <SignedIn>
        <PfpFlow />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}

function PfpFlow() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {
    profilePicUrl,
    status,
    isLoading,
    isInitialLoading,
    handleUpload,
    handleRemove,
  } = useProfilePicture(TEST_USER_ID)

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      fileInputRef.current.click()
    }
  }

  const onRemove = async () => {
    await handleRemove()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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

      <div style={{ marginBottom: '32px' }}>
        <div
          style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '500' }}
        >
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

      <div style={{ marginBottom: '24px' }}>
        <div
          style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '500' }}
        >
          Actions
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleUpload(file)
            }}
          />
          <button
            type="button"
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
            type="button"
            onClick={() => void onRemove()}
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
