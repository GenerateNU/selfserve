import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { setConfig } from '@shared'
import { useEffect } from 'react'
import appCss from '../styles.css?url'

// Client explicity created outside the component to avoid recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'SelfServe',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap',
      },
    ],
  }),

  shellComponent: RootDocument,
})

// Component to configure auth provider and the api base url
function AppConfigurator() {
  const { getToken } = useAuth()
  useEffect(() => {
    setConfig({ API_BASE_URL: process.env.API_BASE_URL ?? '', getToken })
  }, [getToken])

  return null
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ClerkProvider
          publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? ''}
          signInForceRedirectUrl={
            import.meta.env.VITE_CLERK_SIGN_IN_FORCE_REDIRECT_URL ?? '/home'
          }
          signUpForceRedirectUrl={
            import.meta.env.VITE_CLERK_SIGN_UP_FORCE_REDIRECT_URL ?? '/home'
          }
          signInFallbackRedirectUrl={
            import.meta.env.VITE_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL ?? '/home'
          }
          signUpFallbackRedirectUrl={
            import.meta.env.VITE_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL ?? '/home'
          }
        >
          <AppConfigurator />
          <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </ClerkProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
