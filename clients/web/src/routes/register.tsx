import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/register')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div style={{padding: 10}}>
        <form>
            <label> Enter your dev name here:
                <input type="text" style={{boxShadow: '0 2px 8px rgba(0,0,0,0.1)', margin: 5, padding: 5}} />
            </label>
        </form>

    </div>
  )
}
