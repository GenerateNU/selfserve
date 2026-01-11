import { createFileRoute } from '@tanstack/react-router'
import { devsService, Dev } from '@selfserve/clients/shared/src/api/services/dev.service';
import { useEffect, useState } from 'react'
import DevTable from '@components/DevTable'

export const Route = createFileRoute('/register')({
  component: RouteComponent,
})

function RouteComponent() {
    const [devs, setDevs] = useState<Dev[]>([]);
    const [name, setName] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const newDev = await devsService.create(name);
        console.log('Created:', newDev);
        setName('');
        fetchAllDevs();
    }

    async function fetchAllDevs() {
        const devs = await devsService.getAll() as Dev[];
        console.log('Fetched:', devs);
        setDevs(devs);
    }

    useEffect(() => {
        fetchAllDevs();
    }, [])

    return (
    <div style={{padding: 10}}>
        <form onSubmit={handleSubmit}>
            <label> Enter your dev name here:
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{boxShadow: '0 2px 8px rgba(0,0,0,0.5)', margin: 5, padding: 5}}
                />
            </label>
            <button type="submit" style={{boxShadow: '0 2px 8px rgba(0,0,0,0.5)', margin: 5, padding: 5}}>Add Dev</button>
        </form>
        <DevTable devs={devs}/>
    </div>
  )
}