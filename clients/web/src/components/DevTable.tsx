import { Dev } from "@selfserve/clients/shared/src/api/services/dev.service"
export default function DevTable({ devs }: { devs: Dev[] }) {
    return (
        <table style={{
            borderCollapse: 'collapse',
            width: '100%'
        }}>
            <thead>
                <tr>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>ID</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Created</th>
                </tr>
            </thead>
            <tbody>
                {devs.map(dev =>
                    <tr key={dev.id}>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{dev.name}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{dev.id}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{dev.created_at.toString()}</td>
                    </tr>
                )}
            </tbody>
        </table>
    )
}